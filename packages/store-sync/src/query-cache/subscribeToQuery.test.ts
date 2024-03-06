import { beforeEach, describe, expect, it } from "vitest";
import { createHydratedStore, tables } from "./test/createHydratedStore";
import { subscribeToQuery } from "./subscribeToQuery";
import { deployMockGame, worldAbi } from "../../test/mockGame";
import { writeContract } from "viem/actions";
import { keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testClient } from "../../test/common";
import { observe } from "../../test/observe";

const henryAccount = privateKeyToAccount(keccak256(stringToHex("henry")));

describe("subscribeToQuery", async () => {
  await testClient.setBalance({ address: henryAccount.address, value: parseEther("1") });
  const worldAddress = await deployMockGame();

  beforeEach(async () => {
    const state = await testClient.dumpState();
    return async (): Promise<void> => {
      await testClient.loadState({ state });
    };
  });

  it("can get players with a position", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
    });
    const results = observe(result$);

    expect(results.length).toBe(1);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
          [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
        ],
      }
    `);

    await writeContract(testClient, {
      account: henryAccount,
      chain: null,
      address: worldAddress,
      abi: worldAbi,
      functionName: "move",
      args: [1, 2],
    });
    await testClient.mine({ blocks: 2 });
    await fetchLatestLogs();

    expect(results.length).toBe(2);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
          [
            "0xdBa86119a787422C593ceF119E40887f396024E2",
          ],
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
      }
    `);
  });

  it("can get players at position (3, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "=", right: 3 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "=", right: 5 },
      ],
    });
    const results = observe(result$);

    expect(results.length).toBe(1);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
      }
    `);

    await writeContract(testClient, {
      account: henryAccount,
      chain: null,
      address: worldAddress,
      abi: worldAbi,
      functionName: "move",
      args: [3, 5],
    });
    await testClient.mine({ blocks: 2 });
    await fetchLatestLogs();

    expect(results.length).toBe(2);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
      }
    `);

    await writeContract(testClient, {
      account: henryAccount,
      chain: null,
      address: worldAddress,
      abi: worldAbi,
      functionName: "move",
      args: [2, 4],
    });
    await testClient.mine({ blocks: 2 });
    await fetchLatestLogs();

    expect(results.length).toBe(3);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
      }
    `);
  });

  it("can get players within the bounds of (-5, -5) and (5, 5)", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = subscribeToQuery(store, {
      from: [{ tableId: tables.Position.tableId, subject: ["player"] }],
      where: [
        { left: { tableId: tables.Position.tableId, field: "x" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "x" }, op: "<=", right: 5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: ">=", right: -5 },
        { left: { tableId: tables.Position.tableId, field: "y" }, op: "<=", right: 5 },
      ],
    });
    const results = observe(result$);

    expect(results.length).toBe(1);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
      }
    `);

    await writeContract(testClient, {
      account: henryAccount,
      chain: null,
      address: worldAddress,
      abi: worldAbi,
      functionName: "move",
      args: [3, 5],
    });
    await testClient.mine({ blocks: 2 });
    await fetchLatestLogs();

    expect(results.length).toBe(2);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
          [
            "0x5f2cC8fb10299751348e1b10f5F1Ba47820B1cB8",
          ],
        ],
      }
    `);

    await writeContract(testClient, {
      account: henryAccount,
      chain: null,
      address: worldAddress,
      abi: worldAbi,
      functionName: "move",
      args: [100, 100],
    });
    await testClient.mine({ blocks: 2 });
    await fetchLatestLogs();

    expect(results.length).toBe(3);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
          [
            "0x078cf0753dd50f7C56F20B3Ae02719EA199BE2eb",
          ],
        ],
      }
    `);
  });

  it("can get players that are still alive", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = subscribeToQuery(store, {
      from: [
        { tableId: tables.Position.tableId, subject: ["player"] },
        { tableId: tables.Health.tableId, subject: ["player"] },
      ],
      where: [{ left: { tableId: tables.Health.tableId, field: "health" }, op: "!=", right: 0n }],
    });
    const results = observe(result$);

    expect(results.length).toBe(1);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            "0x1D96F2f6BeF1202E4Ce1Ff6Dad0c2CB002861d3e",
          ],
          [
            "0x328809Bc894f92807417D2dAD6b7C998c1aFdac6",
          ],
        ],
      }
    `);
  });

  it("can get all players in grassland", async () => {
    const { store, fetchLatestLogs } = await createHydratedStore(worldAddress);
    const result$ = subscribeToQuery(store, {
      from: [{ tableId: tables.Terrain.tableId, subject: ["x", "y"] }],
      where: [{ left: { tableId: tables.Terrain.tableId, field: "terrainType" }, op: "=", right: 2 }],
    });

    const results = observe(result$);

    expect(results.length).toBe(1);
    expect(results.lastValue).toMatchInlineSnapshot(`
      {
        "subjects": [
          [
            3,
            5,
          ],
        ],
      }
    `);
  });
});
