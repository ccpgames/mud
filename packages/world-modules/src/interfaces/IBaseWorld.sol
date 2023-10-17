// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/* Autogenerated file. Do not edit manually. */

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { IWorldKernel } from "@latticexyz/world/src/IWorldKernel.sol";

import { IERC20System } from "./IERC20System.sol";

/**
 * @title IBaseWorld
 * @notice This interface integrates all systems and associated function selectors
 * that are dynamically registered in the World during deployment.
 * @dev This is an autogenerated file; do not edit manually.
 */
interface IBaseWorld is IStore, IWorldKernel, IERC20System {

}
