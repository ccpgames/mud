import { execa } from "execa";
import {
  ClientConfig,
  RpcLog,
  createPublicClient,
  createWalletClient,
  encodeEventTopics,
  http,
  isHex,
  numberToHex,
  getContract,
  ContractFunctionConfig,
} from "viem";
import { mudFoundry } from "@latticexyz/common/chains";
import { storeEventsAbi } from "@latticexyz/store";
import { privateKeyToAccount } from "viem/accounts";
import IWorldAbi from "../contracts/out/IWorld.sol/IWorld.abi.json";

type WorldAbi = typeof IWorldAbi;

export type SystemCall<functionName extends string = string> = Pick<
  ContractFunctionConfig<WorldAbi, functionName>,
  "functionName" | "args"
>;

export async function generateLogs(rpc: string, systemCalls: SystemCall[]): Promise<RpcLog[]> {
  console.log("deploying world");
  const { stdout, stderr } = await execa("pnpm", ["mud", "deploy", "--rpc", rpc, "--saveDeployment", "false"], {
    cwd: "../contracts",
    stdio: "pipe",
    env: {
      DEBUG: "mud:*",
    },
  });
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);

  const [, worldAddress] = stdout.match(/worldAddress: '(0x[0-9a-f]+)'/i) ?? [];
  if (!isHex(worldAddress)) {
    throw new Error("world address not found in output, did the deploy fail?");
  }
  console.log("got world address", worldAddress);

  const clientOptions = {
    chain: mudFoundry,
    transport: http(rpc),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  // anvil default private key
  const account = privateKeyToAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  const walletClient = createWalletClient({
    ...clientOptions,
    account,
  });

  // use viem Contract instance to avoid nonce management
  const worldContract = getContract({
    address: worldAddress,
    abi: IWorldAbi,
    publicClient,
    walletClient,
  });

  for (let i = 0; i < systemCalls.length - 1; i++) {
    await worldContract.write[systemCalls[i].functionName](systemCalls[i].args);
  }
  const lastTx = await worldContract.write[systemCalls[systemCalls.length - 1].functionName](
    systemCalls[systemCalls.length - 1].args
  );

  console.log("waiting for tx");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: lastTx });

  console.log("fetching logs", receipt.blockNumber);
  const logs = await publicClient.request({
    method: "eth_getLogs",
    params: [
      {
        address: worldAddress,
        topics: [
          storeEventsAbi.flatMap((event) =>
            encodeEventTopics({
              abi: [event],
              eventName: event.name,
            })
          ),
        ],
        fromBlock: numberToHex(0n),
        toBlock: numberToHex(receipt.blockNumber),
      },
    ],
  });

  return logs;
}
