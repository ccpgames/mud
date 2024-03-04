// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { BytesStruct, StringStruct } from "./../../systems/structs.sol";

/**
 * @title IStructSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IStructSystem {
  function staticArrayBytesStruct(BytesStruct[1] memory) external;

  function dynamicArrayBytesStruct(BytesStruct[] memory) external;

  function staticArrayStringStruct(StringStruct[1] memory) external;

  function dynamicArrayStringStruct(StringStruct[] memory) external;
}
