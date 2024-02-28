// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

// Import schema type
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

// Import store internals
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Memory } from "@latticexyz/store/src/Memory.sol";
import { SliceLib } from "@latticexyz/store/src/Slice.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { FieldLayout, FieldLayoutLib } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { PackedCounter, PackedCounterLib } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

// Import user types
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

library SystemHooks {
  // Hex below is the result of `WorldResourceIdLib.encode({ namespace: "world", name: "SystemHooks", typeId: RESOURCE_TABLE });`
  ResourceId constant _tableId = ResourceId.wrap(0x7462776f726c6400000000000000000053797374656d486f6f6b730000000000);

  FieldLayout constant _fieldLayout =
    FieldLayout.wrap(0x0000000100000000000000000000000000000000000000000000000000000000);

  /**
   * @notice Get the table's key schema.
   * @return _keySchema The key schema for the table.
   */
  function getKeySchema() internal pure returns (Schema) {
    SchemaType[] memory _keySchema = new SchemaType[](1);
    _keySchema[0] = SchemaType.BYTES32;

    return SchemaLib.encode(_keySchema);
  }

  /**
   * @notice Get the table's value schema.
   * @return _valueSchema The value schema for the table.
   */
  function getValueSchema() internal pure returns (Schema) {
    SchemaType[] memory _valueSchema = new SchemaType[](1);
    _valueSchema[0] = SchemaType.BYTES21_ARRAY;

    return SchemaLib.encode(_valueSchema);
  }

  /**
   * @notice Get the table's key field names.
   * @return keyNames An array of strings with the names of key fields.
   */
  function getKeyNames() internal pure returns (string[] memory keyNames) {
    keyNames = new string[](1);
    keyNames[0] = "systemId";
  }

  /**
   * @notice Get the table's value field names.
   * @return fieldNames An array of strings with the names of value fields.
   */
  function getFieldNames() internal pure returns (string[] memory fieldNames) {
    fieldNames = new string[](1);
    fieldNames[0] = "value";
  }

  /**
   * @notice Register the table with its config.
   */
  function register() internal {
    StoreSwitch.registerTable(_tableId, _fieldLayout, getKeySchema(), getValueSchema(), getKeyNames(), getFieldNames());
  }

  /**
   * @notice Register the table with its config.
   */
  function _register() internal {
    StoreCore.registerTable(_tableId, _fieldLayout, getKeySchema(), getValueSchema(), getKeyNames(), getFieldNames());
  }

  /**
   * @notice Get value.
   */
  function getValue(ResourceId systemId) internal view returns (bytes21[] memory value) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    bytes memory _blob = StoreSwitch.getDynamicField(_tableId, _keyTuple, 0);
    return (SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_bytes21());
  }

  /**
   * @notice Get value.
   */
  function _getValue(ResourceId systemId) internal view returns (bytes21[] memory value) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    bytes memory _blob = StoreCore.getDynamicField(_tableId, _keyTuple, 0);
    return (SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_bytes21());
  }

  /**
   * @notice Get value.
   */
  function get(ResourceId systemId) internal view returns (bytes21[] memory value) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    bytes memory _blob = StoreSwitch.getDynamicField(_tableId, _keyTuple, 0);
    return (SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_bytes21());
  }

  /**
   * @notice Get value.
   */
  function _get(ResourceId systemId) internal view returns (bytes21[] memory value) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    bytes memory _blob = StoreCore.getDynamicField(_tableId, _keyTuple, 0);
    return (SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_bytes21());
  }

  /**
   * @notice Set value.
   */
  function setValue(ResourceId systemId, bytes21[] memory value) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.setDynamicField(_tableId, _keyTuple, 0, EncodeArray.encode((value)));
  }

  /**
   * @notice Set value.
   */
  function _setValue(ResourceId systemId, bytes21[] memory value) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.setDynamicField(_tableId, _keyTuple, 0, EncodeArray.encode((value)));
  }

  /**
   * @notice Set value.
   */
  function set(ResourceId systemId, bytes21[] memory value) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.setDynamicField(_tableId, _keyTuple, 0, EncodeArray.encode((value)));
  }

  /**
   * @notice Set value.
   */
  function _set(ResourceId systemId, bytes21[] memory value) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.setDynamicField(_tableId, _keyTuple, 0, EncodeArray.encode((value)));
  }

  /**
   * @notice Get the length of value.
   */
  function lengthValue(ResourceId systemId) internal view returns (uint256) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    uint256 _byteLength = StoreSwitch.getDynamicFieldLength(_tableId, _keyTuple, 0);
    unchecked {
      return _byteLength / 21;
    }
  }

  /**
   * @notice Get the length of value.
   */
  function _lengthValue(ResourceId systemId) internal view returns (uint256) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    uint256 _byteLength = StoreCore.getDynamicFieldLength(_tableId, _keyTuple, 0);
    unchecked {
      return _byteLength / 21;
    }
  }

  /**
   * @notice Get the length of value.
   */
  function length(ResourceId systemId) internal view returns (uint256) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    uint256 _byteLength = StoreSwitch.getDynamicFieldLength(_tableId, _keyTuple, 0);
    unchecked {
      return _byteLength / 21;
    }
  }

  /**
   * @notice Get the length of value.
   */
  function _length(ResourceId systemId) internal view returns (uint256) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    uint256 _byteLength = StoreCore.getDynamicFieldLength(_tableId, _keyTuple, 0);
    unchecked {
      return _byteLength / 21;
    }
  }

  /**
   * @notice Get an item of value.
   * @dev Reverts with Store_IndexOutOfBounds if `_index` is out of bounds for the array.
   */
  function getItemValue(ResourceId systemId, uint256 _index) internal view returns (bytes21) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _blob = StoreSwitch.getDynamicFieldSlice(_tableId, _keyTuple, 0, _index * 21, (_index + 1) * 21);
      return (bytes21(_blob));
    }
  }

  /**
   * @notice Get an item of value.
   * @dev Reverts with Store_IndexOutOfBounds if `_index` is out of bounds for the array.
   */
  function _getItemValue(ResourceId systemId, uint256 _index) internal view returns (bytes21) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _blob = StoreCore.getDynamicFieldSlice(_tableId, _keyTuple, 0, _index * 21, (_index + 1) * 21);
      return (bytes21(_blob));
    }
  }

  /**
   * @notice Get an item of value.
   * @dev Reverts with Store_IndexOutOfBounds if `_index` is out of bounds for the array.
   */
  function getItem(ResourceId systemId, uint256 _index) internal view returns (bytes21) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _blob = StoreSwitch.getDynamicFieldSlice(_tableId, _keyTuple, 0, _index * 21, (_index + 1) * 21);
      return (bytes21(_blob));
    }
  }

  /**
   * @notice Get an item of value.
   * @dev Reverts with Store_IndexOutOfBounds if `_index` is out of bounds for the array.
   */
  function _getItem(ResourceId systemId, uint256 _index) internal view returns (bytes21) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _blob = StoreCore.getDynamicFieldSlice(_tableId, _keyTuple, 0, _index * 21, (_index + 1) * 21);
      return (bytes21(_blob));
    }
  }

  /**
   * @notice Push an element to value.
   */
  function pushValue(ResourceId systemId, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.pushToDynamicField(_tableId, _keyTuple, 0, abi.encodePacked((_element)));
  }

  /**
   * @notice Push an element to value.
   */
  function _pushValue(ResourceId systemId, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.pushToDynamicField(_tableId, _keyTuple, 0, abi.encodePacked((_element)));
  }

  /**
   * @notice Push an element to value.
   */
  function push(ResourceId systemId, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.pushToDynamicField(_tableId, _keyTuple, 0, abi.encodePacked((_element)));
  }

  /**
   * @notice Push an element to value.
   */
  function _push(ResourceId systemId, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.pushToDynamicField(_tableId, _keyTuple, 0, abi.encodePacked((_element)));
  }

  /**
   * @notice Pop an element from value.
   */
  function popValue(ResourceId systemId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.popFromDynamicField(_tableId, _keyTuple, 0, 21);
  }

  /**
   * @notice Pop an element from value.
   */
  function _popValue(ResourceId systemId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.popFromDynamicField(_tableId, _keyTuple, 0, 21);
  }

  /**
   * @notice Pop an element from value.
   */
  function pop(ResourceId systemId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.popFromDynamicField(_tableId, _keyTuple, 0, 21);
  }

  /**
   * @notice Pop an element from value.
   */
  function _pop(ResourceId systemId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.popFromDynamicField(_tableId, _keyTuple, 0, 21);
  }

  /**
   * @notice Update an element of value at `_index`.
   */
  function updateValue(ResourceId systemId, uint256 _index, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _encoded = abi.encodePacked((_element));
      StoreSwitch.spliceDynamicData(_tableId, _keyTuple, 0, uint40(_index * 21), uint40(_encoded.length), _encoded);
    }
  }

  /**
   * @notice Update an element of value at `_index`.
   */
  function _updateValue(ResourceId systemId, uint256 _index, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _encoded = abi.encodePacked((_element));
      StoreCore.spliceDynamicData(_tableId, _keyTuple, 0, uint40(_index * 21), uint40(_encoded.length), _encoded);
    }
  }

  /**
   * @notice Update an element of value at `_index`.
   */
  function update(ResourceId systemId, uint256 _index, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _encoded = abi.encodePacked((_element));
      StoreSwitch.spliceDynamicData(_tableId, _keyTuple, 0, uint40(_index * 21), uint40(_encoded.length), _encoded);
    }
  }

  /**
   * @notice Update an element of value at `_index`.
   */
  function _update(ResourceId systemId, uint256 _index, bytes21 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    unchecked {
      bytes memory _encoded = abi.encodePacked((_element));
      StoreCore.spliceDynamicData(_tableId, _keyTuple, 0, uint40(_index * 21), uint40(_encoded.length), _encoded);
    }
  }

  /**
   * @notice Delete all data for given keys.
   */
  function deleteRecord(ResourceId systemId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreSwitch.deleteRecord(_tableId, _keyTuple);
  }

  /**
   * @notice Delete all data for given keys.
   */
  function _deleteRecord(ResourceId systemId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    StoreCore.deleteRecord(_tableId, _keyTuple, _fieldLayout);
  }

  /**
   * @notice Tightly pack dynamic data lengths using this table's schema.
   * @return _encodedLengths The lengths of the dynamic fields (packed into a single bytes32 value).
   */
  function encodeLengths(bytes21[] memory value) internal pure returns (PackedCounter _encodedLengths) {
    // Lengths are effectively checked during copy by 2**40 bytes exceeding gas limits
    unchecked {
      _encodedLengths = PackedCounterLib.pack(value.length * 21);
    }
  }

  /**
   * @notice Tightly pack dynamic (variable length) data using this table's schema.
   * @return The dynamic data, encoded into a sequence of bytes.
   */
  function encodeDynamic(bytes21[] memory value) internal pure returns (bytes memory) {
    return abi.encodePacked(EncodeArray.encode((value)));
  }

  /**
   * @notice Encode all of a record's fields.
   * @return The static (fixed length) data, encoded into a sequence of bytes.
   * @return The lengths of the dynamic fields (packed into a single bytes32 value).
   * @return The dynamic (variable length) data, encoded into a sequence of bytes.
   */
  function encode(bytes21[] memory value) internal pure returns (bytes memory, PackedCounter, bytes memory) {
    bytes memory _staticData;
    PackedCounter _encodedLengths = encodeLengths(value);
    bytes memory _dynamicData = encodeDynamic(value);

    return (_staticData, _encodedLengths, _dynamicData);
  }

  /**
   * @notice Encode keys as a bytes32 array using this table's field layout.
   */
  function encodeKeyTuple(ResourceId systemId) internal pure returns (bytes32[] memory) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(systemId);

    return _keyTuple;
  }
}
