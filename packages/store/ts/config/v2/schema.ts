import { evaluate } from "@arktype/util";
import { AbiTypeScope } from "./scope";

export type SchemaInput<scope extends AbiTypeScope = AbiTypeScope> = {
  [key: string]: keyof scope["types"];
};

export type resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope> = evaluate<{
  [key in keyof schema]: {
    /** the Solidity primitive ABI type */
    type: scope["types"][schema[key]];
    /** the user defined type or Solidity primitive ABI type */
    internalType: schema[key];
  };
}>;

export function resolveSchema<schema extends SchemaInput<scope>, scope extends AbiTypeScope = AbiTypeScope>(
  schema: schema,
  scope?: scope,
): resolveSchema<schema, scope> {
  // TODO: runtime validation
  const resolvedScope = scope ?? AbiTypeScope;
  return Object.fromEntries(
    Object.entries(schema).map(([key, type]) => [
      key,
      {
        // TODO: any way to do this without type casting?
        type: (resolvedScope.types as scope["types"])[type],
        internalType: type,
      },
    ]),
  ) as resolveSchema<schema, scope>;
}

export function isSchemaInput<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope = AbiTypeScope as scope,
): input is SchemaInput<scope> {
  return (
    typeof input === "object" && input !== null && Object.values(input).every((key) => Object.hasOwn(scope.types, key))
  );
}
