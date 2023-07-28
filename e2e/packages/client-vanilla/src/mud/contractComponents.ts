/* Autogenerated file. Do not edit manually. */

import {
  defineComponent,
  Type as RecsType,
  type World,
} from "@latticexyz/recs";

export function defineContractComponents(world: World) {
  return {
    Number: (() => {
      return defineComponent(
        world,
        {
          value: RecsType.Number,
        },
        {
          id: "0x000000000000000000000000000000004e756d62657200000000000000000000",
          metadata: {
            componentName: "Number",
            tableName: ":Number",
            keySchema: { key: "uint32" },
            valueSchema: { value: "uint32" },
          },
        } as const
      );
    })(),
    Vector: (() => {
      return defineComponent(
        world,
        {
          x: RecsType.Number,
          y: RecsType.Number,
        },
        {
          id: "0x00000000000000000000000000000000566563746f7200000000000000000000",
          metadata: {
            componentName: "Vector",
            tableName: ":Vector",
            keySchema: { key: "uint32" },
            valueSchema: { x: "int32", y: "int32" },
          },
        } as const
      );
    })(),
    NumberList: (() => {
      return defineComponent(
        world,
        {
          value: RecsType.NumberArray,
        },
        {
          id: "0x000000000000000000000000000000004e756d6265724c697374000000000000",
          metadata: {
            componentName: "NumberList",
            tableName: ":NumberList",
            keySchema: {},
            valueSchema: { value: "uint32[]" },
          },
        } as const
      );
    })(),
    Multi: (() => {
      return defineComponent(
        world,
        {
          num: RecsType.BigInt,
          value: RecsType.Boolean,
        },
        {
          id: "0x000000000000000000000000000000004d756c74690000000000000000000000",
          metadata: {
            componentName: "Multi",
            tableName: ":Multi",
            keySchema: { a: "uint32", b: "bool", c: "uint256", d: "int120" },
            valueSchema: { num: "int256", value: "bool" },
          },
        } as const
      );
    })(),
  };
}
