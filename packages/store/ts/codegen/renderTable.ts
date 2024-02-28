import {
  RenderDynamicField,
  renderArguments,
  renderCommonData,
  renderList,
  renderImports,
  renderTableId,
  renderTypeHelpers,
  renderWithStore,
  renderedSolidityHeader,
  RenderStaticField,
} from "@latticexyz/common/codegen";
import { renderEncodeFieldSingle, renderFieldMethods } from "./field";
import { renderDeleteRecordMethods, renderRecordData, renderRecordMethods } from "./record";
import { renderFieldLayout } from "./renderFieldLayout";
import { RenderTableOptions } from "./types";

/**
 * Renders Solidity code for a MUD table library, using the specified options
 * @param options options for rendering the table
 * @returns string of Solidity code
 */
export function renderTable(options: RenderTableOptions) {
  const {
    imports,
    libraryName,
    structName,
    staticResourceData,
    storeImportPath,
    fields,
    staticFields,
    dynamicFields,
    withRecordMethods,
    storeArgument,
    keyTuple,
  } = options;

  const { _typedTableId, _typedKeyArgs, _keyTupleDefinition } = renderCommonData(options);

  return `
    ${renderedSolidityHeader}

    // Import schema type
    import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

    // Import store internals
    import { IStore } from "${storeImportPath}IStore.sol";
    import { StoreSwitch } from "${storeImportPath}StoreSwitch.sol";
    import { StoreCore } from "${storeImportPath}StoreCore.sol";
    import { Bytes } from "${storeImportPath}Bytes.sol";
    import { Memory } from "${storeImportPath}Memory.sol";
    import { SliceLib } from "${storeImportPath}Slice.sol";
    import { EncodeArray } from "${storeImportPath}tightcoder/EncodeArray.sol";
    import { FieldLayout, FieldLayoutLib } from "${storeImportPath}FieldLayout.sol";
    import { Schema, SchemaLib } from "${storeImportPath}Schema.sol";
    import { PackedCounter, PackedCounterLib } from "${storeImportPath}PackedCounter.sol";
    import { ResourceId } from "${storeImportPath}ResourceId.sol";

    ${
      imports.length > 0
        ? `
          // Import user types
          ${renderImports(imports)}
          `
        : ""
    }

    ${
      !structName
        ? ""
        : `
          struct ${structName} {
            ${renderList(fields, ({ name, typeId }) => `${typeId} ${name};`)}
          }
          `
    }

    library ${libraryName} {
      ${staticResourceData ? renderTableId(staticResourceData) : ""}
  
      ${renderFieldLayout(fields)}

      /** 
       * @notice Get the table's key schema.
       * @return _keySchema The key schema for the table.
       */
      function getKeySchema() internal pure returns (Schema) {
        SchemaType[] memory _keySchema = new SchemaType[](${keyTuple.length});
        ${renderList(keyTuple, ({ enumName }, index) => `_keySchema[${index}] = SchemaType.${enumName};`)}

        return SchemaLib.encode(_keySchema);
      }

      /**
       * @notice Get the table's value schema.
       * @return _valueSchema The value schema for the table.
       */
      function getValueSchema() internal pure returns (Schema) {
        SchemaType[] memory _valueSchema = new SchemaType[](${fields.length});
        ${renderList(fields, ({ enumName }, index) => `_valueSchema[${index}] = SchemaType.${enumName};`)}

        return SchemaLib.encode(_valueSchema);
      }

      /**
       * @notice Get the table's key field names.
       * @return keyNames An array of strings with the names of key fields.
       */
      function getKeyNames() internal pure returns (string[] memory keyNames) {
        keyNames = new string[](${keyTuple.length});
        ${renderList(keyTuple, (keyElement, index) => `keyNames[${index}] = "${keyElement.name}";`)}
      }

      /**
       * @notice Get the table's value field names.
       * @return fieldNames An array of strings with the names of value fields.
       */
      function getFieldNames() internal pure returns (string[] memory fieldNames) {
        fieldNames = new string[](${fields.length});
        ${renderList(fields, (field, index) => `fieldNames[${index}] = "${field.name}";`)}
      }

      ${renderWithStore(
        storeArgument,
        ({ _typedStore, _store, _commentSuffix, _methodNamePrefix }) => `
          /**
           * @notice Register the table with its config${_commentSuffix}.
           */
          function ${_methodNamePrefix}register(${renderArguments([_typedStore, _typedTableId])}) internal {
            ${_store}.registerTable(_tableId, _fieldLayout, getKeySchema(), getValueSchema(), getKeyNames(), getFieldNames());
          }
        `
      )}

      ${renderFieldMethods(options)}

      ${withRecordMethods ? renderRecordMethods(options) : ""}

      ${renderDeleteRecordMethods(options)}

      ${renderEncodeStatic(staticFields)}

      ${renderEncodeLengths(dynamicFields)}

      ${renderEncodeDynamic(dynamicFields)}

      /**
       * @notice Encode all of a record's fields.
       * @return The static (fixed length) data, encoded into a sequence of bytes.
       * @return The lengths of the dynamic fields (packed into a single bytes32 value).
       * @return The dynamic (variable length) data, encoded into a sequence of bytes.
       */
      function encode(${renderArguments(
        options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
      )}) internal pure returns (bytes memory, PackedCounter, bytes memory) {
        ${renderRecordData(options)}

        return (_staticData, _encodedLengths, _dynamicData);
      }
      
      /**
       * @notice Encode keys as a bytes32 array using this table's field layout.
       */
      function encodeKeyTuple(${renderArguments([_typedKeyArgs])}) internal pure returns (bytes32[] memory) {
        ${_keyTupleDefinition}
        return _keyTuple;
      }
    }

    ${renderTypeHelpers(options)}
  `;
}

/**
 * Renders solidity code for `encodeStatic` method, which encodes the provided fields into a blob for storage
 * (nothing is rendered if static fields array is empty)
 * @param staticFields array of data about static fields to be encoded
 * @returns string of Solidity code
 */
function renderEncodeStatic(staticFields: RenderStaticField[]) {
  if (staticFields.length === 0) return "";

  return `
    /**
     * @notice Tightly pack static (fixed length) data using this table's schema.
     * @return The static data, encoded into a sequence of bytes.
     */
    function encodeStatic(${renderArguments(
      staticFields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (bytes memory) {
      return abi.encodePacked(${renderArguments(staticFields.map(({ name }) => name))});
    }
  `;
}

/**
 * Renders solidity code for `encodeLengths` method, which tightly packs the lengths of the provided fields
 * (nothing is rendered if dynamic fields array is empty)
 * @param dynamicFields array of data about dynamic fields to have their lengths encoded
 * @returns string of Solidity code
 */
function renderEncodeLengths(dynamicFields: RenderDynamicField[]) {
  if (dynamicFields.length === 0) return "";

  return `
    /**
     * @notice Tightly pack dynamic data lengths using this table's schema.
     * @return _encodedLengths The lengths of the dynamic fields (packed into a single bytes32 value).
     */
    function encodeLengths(${renderArguments(
      dynamicFields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (PackedCounter _encodedLengths) {
      // Lengths are effectively checked during copy by 2**40 bytes exceeding gas limits
      unchecked {
        _encodedLengths = PackedCounterLib.pack(
          ${renderArguments(
            dynamicFields.map(({ name, arrayElement }) => {
              if (arrayElement) {
                return `${name}.length * ${arrayElement.staticByteLength}`;
              } else {
                return `bytes(${name}).length`;
              }
            })
          )}
        );
      }
    }
  `;
}

/**
 * Renders solidity code for `encodeDynamic` method, which encodes the provided fields into a blob for storage
 * (nothing is rendered if dynamic fields array is empty)
 * @param dynamicFields array of data about dynamic fields to be encoded
 * @returns string of Solidity code
 */
function renderEncodeDynamic(dynamicFields: RenderDynamicField[]) {
  if (dynamicFields.length === 0) return "";

  return `
    /**
     * @notice Tightly pack dynamic (variable length) data using this table's schema.
     * @return The dynamic data, encoded into a sequence of bytes.
     */
    function encodeDynamic(${renderArguments(
      dynamicFields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (bytes memory) {
      return abi.encodePacked(${renderArguments(dynamicFields.map((field) => renderEncodeFieldSingle(field)))});
    }
  `;
}
