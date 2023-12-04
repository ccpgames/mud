import { FetchLogsOptions, FetchLogsResult, fetchLogs, groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { StoreEventsAbi } from "@latticexyz/store";
import { StorageAdapter, StorageAdapterBlock } from "./common";

type FetchAndStoreLogsOptions = FetchLogsOptions<StoreEventsAbi> & {
  storageAdapter: StorageAdapter;
  logFilter?: (log: FetchLogsResult<StoreEventsAbi>["logs"][number]) => boolean;
};

export async function* fetchAndStoreLogs({
  storageAdapter,
  logFilter,
  ...fetchLogsOptions
}: FetchAndStoreLogsOptions): AsyncGenerator<StorageAdapterBlock> {
  for await (const { logs, toBlock } of fetchLogs(fetchLogsOptions)) {
    const blocks = groupLogsByBlockNumber(logFilter ? logs.filter(logFilter) : logs, toBlock);
    for (const block of blocks) {
      await storageAdapter(block);
      yield block;
    }
  }
}
