import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { resolveTableConfig, resolveTableShorthand, validateKeys } from "./table";
import { AbiTypeScope, extendScope, getStaticAbiTypeKeys } from "./scope";

describe("validateKeys", () => {
  it("should return a tuple of valid keys", () => {
    attest<
      ["static"],
      validateKeys<getStaticAbiTypeKeys<{ static: "uint256"; dynamic: "string" }, AbiTypeScope>, ["static"]>
    >();
  });

  it("should return a tuple of valid keys with an extended scope", () => {
    const scope = extendScope(AbiTypeScope, { static: "address", dynamic: "string" });
    attest<
      ["static", "customStatic"],
      validateKeys<
        getStaticAbiTypeKeys<
          { static: "uint256"; dynamic: "string"; customStatic: "static"; customDynamic: "dynamic" },
          typeof scope
        >,
        ["static", "customStatic"]
      >
    >();
  });

  it("should throw if an invalid key is provided", () => {
    attest(
      // @ts-expect-error Type '"dynamic"' is not assignable to type '"static"'.
      validateKeys<getStaticAbiTypeKeys<{ static: "uint256"; dynamic: "string" }, AbiTypeScope>>(["dynamic"]),
    ).type.errors(`Type '"dynamic"' is not assignable to type '"static"'.`);
  });

  it("should return a tuple of valid keys with an extended scope", () => {
    const scope = extendScope(AbiTypeScope, { static: "address", dynamic: "string" });
    attest<
      ["static", "customStatic"],
      validateKeys<
        getStaticAbiTypeKeys<
          { static: "uint256"; dynamic: "string"; customStatic: "static"; customDynamic: "dynamic" },
          typeof scope
        >,
        ["static", "customStatic"]
      >
    >();
  });
});

describe("resolveTableShorthand", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthand("address");
    attest(table)
      .snap({ schema: { key: "bytes32", value: "address" }, primaryKey: ["key"] })
      .type.toString.snap('{ schema: { key: "bytes32"; value: "address"; }; primaryKey: ["key"]; }');
  });

  it("should expand a single custom into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthand("CustomType", scope);
    attest<{
      schema: {
        key: "bytes32";
        value: "CustomType";
      };
      primaryKey: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "bytes32"; value: "CustomType"; }; primaryKey: ["key"]; }');
  });

  it("should throw if the provided shorthand is not an ABI type and no user types are provided", () => {
    attest(() =>
      // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type AbiType'
      resolveTableShorthand("NotAnAbiType"),
    )
      .throws("Invalid schema type, `NotAnAbiType` not found in scope.")
      .type.errors(`Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'.`);
  });

  it("should throw if the provided shorthand is not a user type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    attest(() =>
      // @ts-expect-error Argument of type '"NotACustomType"' is not assignable to parameter of type AbiType | "CustomType"
      resolveTableShorthand("NotACustomType", scope),
    )
      .throws("Invalid schema type, `NotACustomType` not found in scope.")
      .type.errors(
        `Argument of type '"NotACustomType"' is not assignable to parameter of type 'AbiType | "CustomType"'.`,
      );
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableShorthand({ key: "address", name: "string", age: "uint256" });
    attest<{
      schema: {
        key: "address";
        name: "string";
        age: "uint256";
      };
      primaryKey: ["key"];
    }>(table).type.toString.snap(
      '{ schema: { key: "address"; name: "string"; age: "uint256"; }; primaryKey: ["key"]; }',
    );
  });

  it("should throw an error if the shorthand doesn't include a key field", () => {
    attest(() =>
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.
      resolveTableShorthand({ name: "string", age: "uint256" }),
    )
      .throws('Invalid table shorthand, did not find `key` in schema input `{"name":"string","age":"uint256"}`.')
      .type.errors("Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.");
  });

  it("should throw an error if the shorthand config includes a non-static key field", () => {
    attest(() =>
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.
      resolveTableShorthand({ key: "string", name: "string", age: "uint256" }),
    )
      .throws("Invalid schema type for `key`, `string` not found in scope.")
      .type.errors("Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.");
  });

  it("should throw an error if an invalid type is passed in", () => {
    // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType'.
    attest(resolveTableShorthand({ key: "uint256", name: "NotACustomType" })).type.errors(
      `Type '"NotACustomType"' is not assignable to type 'AbiType'.`,
    );
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthand({ key: "CustomType", name: "string", age: "uint256" }, scope);
    attest<{
      schema: { key: "CustomType"; name: "string"; age: "uint256" };
      primaryKey: ["key"];
    }>(table).type.toString.snap(
      '{ schema: { key: "CustomType"; name: "string"; age: "uint256"; }; primaryKey: ["key"]; }',
    );
  });

  it("should throw an error if `key` is not a custom static type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    attest(() =>
      // @ts-expect-error "Error: Provide a `key` field with static ABI type or a full config with explicit `primaryKey`."
      resolveTableShorthand({ key: "CustomType", name: "string", age: "uint256" }, scope),
    )
      .throws("Invalid schema type for `key`, `CustomType` not found in scope.")
      .type.errors(`Provide a \`key\` field with static ABI type or a full config with explicit \`primaryKey\`.`);
  });
});

describe("resolveTableConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableConfig("address");
    attest<{
      schema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
        value: {
          type: "address";
          internalType: "address";
        };
      };
      keySchema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
      };
      valueSchema: {
        value: {
          type: "address";
          internalType: "address";
        };
      };
      primaryKey: ["key"];
    }>(table);
  });

  it("should expand a single custom type into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    const table = resolveTableConfig("CustomType", scope);
    attest<{
      schema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
        value: {
          type: "address";
          internalType: "CustomType";
        };
      };
      keySchema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
      };
      valueSchema: {
        value: {
          type: "address";
          internalType: "CustomType";
        };
      };
      primaryKey: ["key"];
    }>(table);
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
    attest<{
      schema: {
        key: {
          type: "address";
          internalType: "address";
        };
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      keySchema: {
        key: {
          type: "address";
          internalType: "address";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      primaryKey: ["key"];
    }>(table);
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableConfig({ key: "CustomType", name: "string", age: "uint256" }, scope);
    attest<{
      schema: {
        key: {
          type: "uint256";
          internalType: "CustomType";
        };
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      keySchema: {
        key: {
          type: "uint256";
          internalType: "CustomType";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      primaryKey: ["key"];
    }>(table);
  });

  it("should throw if the shorthand key is a dynamic ABI type", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.
    attest(resolveTableConfig({ key: "string", name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit `primaryKey`",
    );
  });

  it("should throw if the shorthand key is a dyamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.
    attest(resolveTableConfig({ key: "CustomType" }, scope)).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.",
    );
  });

  it("should throw if the shorthand key is neither a custom nor ABI type", () => {
    // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'
    attest(resolveTableConfig("NotAnAbiType")).type.errors(
      `Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'`,
    );
  });

  it("should throw if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.
    attest(resolveTableConfig({ name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit `primaryKey`.",
    );
  });

  it("should return the full config given a full config with one key", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      primaryKey: ["age"],
    });
    attest<{
      schema: {
        key: { type: "address"; internalType: "address" };
        name: { type: "string"; internalType: "string" };
        age: { type: "uint256"; internalType: "uint256" };
      };
      keySchema: {
        age: { type: "uint256"; internalType: "uint256" };
      };
      valueSchema: {
        key: { type: "address"; internalType: "address" };
        name: { type: "string"; internalType: "string" };
      };
      primaryKey: ["age"];
    }>(table);
  });

  it("should return the full config given a full config with two primaryKey", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      primaryKey: ["age", "key"],
    });
    attest<{
      schema: {
        key: { type: "address"; internalType: "address" };
        name: { type: "string"; internalType: "string" };
        age: { type: "uint256"; internalType: "uint256" };
      };
      keySchema: {
        age: { type: "uint256"; internalType: "uint256" };
        key: { type: "address"; internalType: "address" };
      };
      valueSchema: {
        name: { type: "string"; internalType: "string" };
      };
      primaryKey: ["age", "key"];
    }>(table);
  });

  it("should return the full config given a config with custom types as values", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "address", name: "CustomString", age: "CustomNumber" }, scope);
    attest<{
      schema: {
        key: {
          type: "address";
          internalType: "address";
        };
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      keySchema: {
        key: {
          type: "address";
          internalType: "address";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      primaryKey: ["key"];
    }>(table);
  });

  it("should return the full config given a config with custom type as key", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "CustomNumber", name: "CustomString", age: "CustomNumber" }, scope);
    attest<{
      schema: {
        key: {
          type: "uint256";
          internalType: "CustomNumber";
        };
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      keySchema: {
        key: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      primaryKey: ["key"];
    }>(table);
  });

  it("should throw if the provided key is a dynamic ABI type", () => {
    attest(
      resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
        primaryKey: ["name"],
      }),
    ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should throw if the provided key is a dynamic ABI type if user types are provided", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(
      resolveTableConfig(
        {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
          primaryKey: ["name"],
        },
        scope,
      ),
    ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should throw if the provided key is a dynamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(
      resolveTableConfig(
        {
          schema: { key: "CustomType", name: "string", age: "uint256" },
          // @ts-expect-error Type '"key"' is not assignable to type '"age"'
          primaryKey: ["key"],
        },
        scope,
      ),
    ).type.errors(`Type '"key"' is not assignable to type '"age"'`);
  });

  it("should throw if the provided key is neither a custom nor ABI type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(
      resolveTableConfig(
        {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"NotAKey"' is not assignable to type '"key" | "age"'
          primaryKey: ["NotAKey"],
        },
        scope,
      ),
    ).type.errors(`Type '"NotAKey"' is not assignable to type '"key" | "age"'`);
  });
});
