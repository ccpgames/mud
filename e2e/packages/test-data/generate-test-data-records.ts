import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startProxy } from "@viem/anvil";
import { SystemCall, generateLogs } from "./generateLogs";

const NUM_RECORDS = [10, 100, 1000];

console.log("starting proxy");
await startProxy({
  options: {
    blockTime: 1,
    blockBaseFeePerGas: 0,
    gasLimit: 20_000_000,
  },
});

for (let i = 0; i < NUM_RECORDS.length; i++) {
  const numRecords = NUM_RECORDS[i];

  // each group of logs gets a fresh anvil instance
  const rpc = `http://127.0.0.1:8545/${numRecords}`;

  console.log(`generating logs for ${numRecords} records`);

  const calls: SystemCall[] = [];
  for (let i = 0; i < numRecords; i++) {
    calls.push({ functionName: "setNumber", args: [i, i] });
  }

  const logs = await generateLogs(rpc, calls);

  const logsFilename = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    `../../../test-data/world-logs-${numRecords}.json`
  );

  console.log("writing", logs.length, "logs to", logsFilename);
  await fs.writeFile(logsFilename, JSON.stringify(logs, null, 2));
}

// exit to kill the proxy
process.exit(0);
