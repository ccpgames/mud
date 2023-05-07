import path from "path";
import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { StoreConfig } from "../config";

const getPrototypeContract = (imports: string, name: string, length: string, tableIds: string, data: string) => {
  return `
  // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.0;
  
  import { TemplateContent, TemplateIndex } from "../Tables.sol";
  ${imports}
  
  bytes32 constant ID = "${name}";
  uint256 constant LENGTH = ${length};

  function ${name}Template() {
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    ${tableIds} 
    TemplateIndex.set(ID, tableIds);

    ${data}
  }`;
};

const getSystemContract = (systemImports: string, systemFunctions: string) => {
  return `
  // SPDX-License-Identifier: MIT
  pragma solidity >=0.8.0;

  import { System } from "@latticexyz/world/src/System.sol";
  ${systemImports}

  contract PrototypeSystem is System {
    function createPrototypes() public {
      ${systemFunctions}
    }
  }`;
};

const getValue = (mudConfig: StoreConfig, key: string, value: any) => {
  const schema = mudConfig.tables[key].schema;

  if (typeof schema === "object" && Object.keys(schema).length > 1) {
    const pairs = Object.entries(value)
      .map(([fieldName, fieldValue]) => {
        const val = schema[fieldName];

        if (val in mudConfig.enums) {
          return `${fieldName}: ${val}.${fieldValue}`;
        } else if (val.includes("bytes")) {
          return `${fieldName}: "${fieldValue}"`;
        }
        return `${fieldName}: ${fieldValue}`;
      })
      .join(",");

    return `${key}Data({${pairs}})`;
  } else {
    if (schema.value in mudConfig.enums) {
      return `${schema.value}.${value}`;
    }
    return `${value.value}`;
  }
};

const getPrototypeImports = (mudConfig: StoreConfig, values: object) => {
  const imports =
    Object.entries(values)
      .map(([key]) => {
        if (key in mudConfig.tables) {
          const schema = mudConfig.tables[key].schema;

          if (typeof schema === "object" && Object.keys(schema).length > 1) {
            return `import {${key}, ${key}TableId, ${key}Data} from "../tables/${key}.sol"`;
          } else {
            if (schema.value in mudConfig.enums) {
              return `import {${key}, ${key}TableId} from "../tables/${key}.sol";
              import {${schema}} from "../Types.sol"`;
            } else {
              return `import {${key}, ${key}TableId} from "../tables/${key}.sol"`;
            }
          }
        } else {
          throw new Error(`There is no table ${key} in your MUD config!`);
        }
      })
      .join(";") + ";";

  return imports;
};

export async function templategen(
  mudConfig: StoreConfig,
  templateConfig: { templates: object },
  outputBaseDirectory: string
) {
  const systemImports =
    Object.keys(templateConfig.templates)
      .map((name) => `import {${name}Template} from "../templates/${name}Template.sol"`)
      .join(";") + ";";
  const systemFunctions =
    Object.keys(templateConfig.templates)
      .map((name) => `${name}Template()`)
      .join("; ") + ";";

  const fullOutputPath = path.join(outputBaseDirectory, `systems/TemplateSystem.sol`);
  const output = getSystemContract(systemImports, systemFunctions);

  await formatAndWriteSolidity(output, fullOutputPath, "Generated system");

  for (const [name, values] of Object.entries(templateConfig.templates)) {
    const fullOutputPath = path.join(outputBaseDirectory, `templates/${name}Template.sol`);

    const tableIds =
      Object.keys(values)
        .map((key, i) => `tableIds[${i}] = ${key}TableId`)
        .join(";") + ";";

    const data =
      Object.entries(values)
        .map(([key, value]) => {
          return `TemplateContent.set(ID, ${key}TableId, abi.encode(${getValue(mudConfig, key, value)}))`;
        })
        .join(";") + ";";

    const imports =
      `import {${Object.keys(mudConfig.enums)
        .map((e) => e)
        .join(",")}} from "../Types.sol";` + getPrototypeImports(mudConfig, values);

    const length = Object.keys(values).length.toString();
    const output = getPrototypeContract(imports, name, length, tableIds, data);

    await formatAndWriteSolidity(output, fullOutputPath, "Generated template");
  }
}
