import { TableRecord } from "../zustand/common";
import { Query, QueryResultSubject } from "./common";
import { Table } from "@latticexyz/store";
import { groupBy } from "@latticexyz/common/utils";
import { encodeAbiParameters } from "viem";
import { matchesCondition } from "./matchesCondition";

// This assumes upstream has fully validated query
// This also assumes we have full records, which may not always be the case and we may need some way to request records for a given table subject
// We don't carry around config types here for ease, they get handled by the wrapping `query` function

type QueryParameters<table extends Table> = {
  readonly records: readonly TableRecord<table>[];
  readonly query: Query;
};

// TODO: make condition types smarter, so condition literal matches the field primitive type

export function findSubjects<table extends Table>({
  records: initialRecords,
  query,
}: QueryParameters<table>): readonly QueryResultSubject[] {
  // TODO: handle `query.except` subjects
  const fromTables = Object.fromEntries(query.from.map((subject) => [subject.tableId, subject.subject]));

  // TODO: store/lookup subjects separately rather than mapping each time so we can "memoize" better?
  const records = initialRecords
    .filter((record) => fromTables[record.table.tableId])
    .map((record) => {
      const subjectFields = fromTables[record.table.tableId];
      const schema = { ...record.table.keySchema, ...record.table.valueSchema };
      const fields = { ...record.key, ...record.value };
      const subject = subjectFields.map((field) => fields[field]);
      const subjectSchema = subjectFields.map((field) => schema[field]);
      const id = encodeAbiParameters(subjectSchema, subject);
      return {
        ...record,
        schema,
        fields,
        subjectSchema,
        subject,
        id,
      };
    });

  const matchedSubjects = Array.from(groupBy(records, (record) => record.id).values())
    .map((records) => ({
      id: records[0].id,
      subject: records[0].subject,
      records,
    }))
    .filter(({ records }) => {
      // make sure our matched subject has records in all `query.from` tables
      const tableIds = Array.from(new Set(records.map((record) => record.table.tableId)));
      return tableIds.length === query.from.length;
    })
    .filter((match) => (query.where ? query.where.every((condition) => matchesCondition(condition, match)) : true));

  return matchedSubjects.map((match) => match.subject);
}
