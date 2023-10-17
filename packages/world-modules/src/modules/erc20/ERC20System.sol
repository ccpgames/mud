// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { AccessControlLib } from "../../utils/AccessControlLib.sol";

import { IERC20Errors } from "./IERC20Errors.sol";
import { IERC20Events } from "./IERC20Events.sol";

import { Allowances } from "./tables/Allowances.sol";
import { Balances } from "./tables/Balances.sol";
import { Metadata } from "./tables/Metadata.sol";

contract ERC20System is System, IERC20Errors, IERC20Events {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @dev See {IERC20-transfer}.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - the caller must have a balance of at least `value`.
   */
  function transfer(
    ResourceId balanceTableId,
    ResourceId metadataTableId,
    address to,
    uint256 value
  ) public virtual returns (bool) {
    address owner = _msgSender();
    _transfer(balanceTableId, metadataTableId, owner, to, value);

    return true;
  }

  /**
   * @dev See {IERC20-allowance}.
   */
  function allowance(
    ResourceId allowanceTableId,
    address owner,
    address spender
  ) public view virtual returns (uint256) {
    return Allowances.get(allowanceTableId, owner, spender);
  }

  /**
   * @dev See {IERC20-approve}.
   *
   * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
   * `transferFrom`. This is semantically equivalent to an infinite approval.
   *
   * Requirements:
   *
   * - `spender` cannot be the zero address.
   */
  function approve(ResourceId allowanceTableId, address spender, uint256 value) public virtual returns (bool) {
    address owner = _msgSender();
    _approve(allowanceTableId, owner, spender, value);

    return true;
  }

  /**
   * @dev See {IERC20-transferFrom}.
   *
   * Emits an {Approval} event indicating the updated allowance. This is not
   * required by the EIP. See the note at the beginning of {ERC20}.
   *
   * NOTE: Does not update the allowance if the current allowance
   * is the maximum `uint256`.
   *
   * Requirements:
   *
   * - `from` and `to` cannot be the zero address.
   * - `from` must have a balance of at least `value`.
   * - the caller must have allowance for ``from``'s tokens of at least
   * `value`.
   */
  function transferFrom(
    ResourceId allowanceTableId,
    ResourceId balanceTableId,
    ResourceId metadataTableId,
    address from,
    address to,
    uint256 value
  ) public virtual returns (bool) {
    address spender = _msgSender();
    _spendAllowance(allowanceTableId, from, spender, value);
    _transfer(balanceTableId, metadataTableId, from, to, value);

    return true;
  }

  /**
   * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
   * Relies on the `_update` mechanism
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   */
  function mint(ResourceId balanceTableId, ResourceId metadataTableId, address account, uint256 value) public {
    // Require the caller to own the namespace
    AccessControlLib.requireOwner(balanceTableId, _msgSender());

    if (account == address(0)) {
      revert ERC20InvalidReceiver(address(0));
    }

    _update(balanceTableId, metadataTableId, address(0), account, value);

    // TODO: move this to the proxy
    emit Transfer(address(0), account, value);
  }

  /**
   * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
   * Relies on the `_update` mechanism.
   *
   * Emits a {Transfer} event with `to` set to the zero address.
   *
   * NOTE: This function is not virtual, {_update} should be overridden instead
   */
  function burn(ResourceId balanceTableId, ResourceId metadataTableId, address account, uint256 value) public {
    // Require the caller to own the namespace
    AccessControlLib.requireOwner(balanceTableId, _msgSender());

    if (account == address(0)) {
      revert ERC20InvalidSender(address(0));
    }

    _update(balanceTableId, metadataTableId, account, address(0), value);

    // TODO: move this to the proxy
    emit Transfer(account, address(0), value);
  }

  /**
   * @dev Moves a `value` amount of tokens from `from` to `to`.
   *
   * This internal function is equivalent to {transfer}, and can be used to
   * e.g. implement automatic token fees, slashing mechanisms, etc.
   *
   * Emits a {Transfer} event.
   *
   * NOTE: This function is not virtual, {_update} should be overridden instead.
   */
  function _transfer(
    ResourceId balanceTableId,
    ResourceId metadataTableId,
    address from,
    address to,
    uint256 value
  ) internal {
    if (from == address(0)) {
      revert ERC20InvalidSender(address(0));
    }
    if (to == address(0)) {
      revert ERC20InvalidReceiver(address(0));
    }
    _update(balanceTableId, metadataTableId, from, to, value);
  }

  /**
   * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
   * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
   * this function.
   *
   * Emits a {Transfer} event.
   */
  function _update(
    ResourceId balanceTableId,
    ResourceId metadataTableId,
    address from,
    address to,
    uint256 value
  ) internal virtual {
    if (from == address(0)) {
      // Overflow check required: The rest of the code assumes that totalSupply never overflows
      Metadata.setTotalSupply(metadataTableId, Metadata.getTotalSupply(metadataTableId) + value);
    } else {
      uint256 fromBalance = Balances.get(balanceTableId, from);
      if (fromBalance < value) {
        revert ERC20InsufficientBalance(from, fromBalance, value);
      }
      unchecked {
        // Overflow not possible: value <= fromBalance <= totalSupply.
        Balances.set(balanceTableId, from, fromBalance - value);
      }
    }

    if (to == address(0)) {
      unchecked {
        // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
        Metadata.setTotalSupply(metadataTableId, Metadata.getTotalSupply(metadataTableId) - value);
      }
    } else {
      unchecked {
        // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
        Balances.set(balanceTableId, to, Balances.get(balanceTableId, to) + value);
      }
    }
  }

  /**
   * @dev Sets `value` as the allowance of `spender` over the `owner`s tokens.
   *
   * Requirements:
   *
   * - `owner` cannot be the zero address.
   * - `spender` cannot be the zero address.
   */
  function _approve(ResourceId allowanceTableId, address owner, address spender, uint256 value) internal virtual {
    if (owner == address(0)) {
      revert ERC20InvalidApprover(address(0));
    }
    if (spender == address(0)) {
      revert ERC20InvalidSpender(address(0));
    }
    Allowances.set(allowanceTableId, owner, spender, value);
  }

  /**
   * @dev Updates `owner` s allowance for `spender` based on spent `value`.
   *
   * Does not update the allowance value in case of infinite allowance.
   * Revert if not enough allowance is available.
   *
   * Does not emit an {Approval} event.
   */
  function _spendAllowance(
    ResourceId allowanceTableId,
    address owner,
    address spender,
    uint256 value
  ) internal virtual {
    uint256 currentAllowance = Allowances.get(allowanceTableId, owner, spender);
    if (currentAllowance != type(uint256).max) {
      if (currentAllowance < value) {
        revert ERC20InsufficientAllowance(spender, currentAllowance, value);
      }
      unchecked {
        _approve(allowanceTableId, owner, spender, currentAllowance - value);
      }
    }
  }
}
