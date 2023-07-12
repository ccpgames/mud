import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { Hex } from "viem";
import { getDatabase, getTables, Table, TableRow } from "./sqlite";
import { createSqliteTable } from "./createSqliteTable";

export const appRouter = router({
  findAll: publicProcedure
    .input(
      z.object({
        chainId: z.number(),
        address: z.string(), // TODO: refine to hex
      })
    )
    .query(async (opts): Promise<{ blockNumber: bigint; tables: (Table & { rows: TableRow[] })[] }> => {
      const { chainId, address } = opts.input;

      const db = await getDatabase(chainId, address as Hex);
      const tables = await getTables(db);

      const result = {
        blockNumber: -1n, // TODO
        tables: await Promise.all(
          tables.map(async (table) => {
            const { tableName, table: sqliteTable } = createSqliteTable(table);
            const rows = db.select().from(sqliteTable).all();
            // console.log("got rows for table", tableName, rows);
            return {
              ...table,
              rows: rows.map((row) => ({
                keyTuple: Object.fromEntries(Object.entries(table.keyTupleSchema).map(([name]) => [name, row[name]])),
                value: Object.fromEntries(Object.entries(table.valueSchema).map(([name]) => [name, row[name]])),
              })),
            };
          })
        ),
      };

      // console.log("findAll:", opts, result);

      return result;
    }),
});

export type AppRouter = typeof appRouter;
