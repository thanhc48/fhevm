// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {UUPSUpgradeableEmptyProxy} from "./shared/UUPSUpgradeableEmptyProxy.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {fhevmExecutorAdd} from "../addresses/FHEVMHostAddresses.sol";

import {ACLEvents} from "./ACLEvents.sol";

/**
 * @title  ACL
 * @notice The ACL (Access Control List) is a permission management system designed to control who can access, compute on,
 * or decrypt encrypted values in fhEVM. By defining and enforcing these permissions, the ACL ensures that encrypted data remains
 * secure while still being usable within authorized contexts.
 */
contract ACL is UUPSUpgradeableEmptyProxy, Ownable2StepUpgradeable, PausableUpgradeable, ACLEvents {
    /// @notice Returned if the delegatee contract is already delegatee for sender & delegator addresses.
    /// @param delegatee delegatee address.
    /// @param contractAddress contract address.
    error AlreadyDelegated(address delegatee, address contractAddress);

    /// @notice Returned if the sender is the delegatee address.
    error SenderCannotBeContractAddress(address contractAddress);

    /// @notice Returned if the contractAddresses array is empty.
    error ContractAddressesIsEmpty();

    /// @notice Maximum length of contractAddresses array exceeded.
    error ContractAddressesMaxLengthExceeded();

    /// @notice Returned if the handlesList array is empty.
    error HandlesListIsEmpty();

    /// @notice Returned if the the delegatee contract is not already delegatee for sender & delegator addresses.
    /// @param delegatee delegatee address.
    /// @param contractAddress contract address.
    error NotDelegatedYet(address delegatee, address contractAddress);

    /// @notice Returned if the sender address is not allowed to pause the contract.
    error NotPauser(address sender);

    /// @notice Returned if the sender address is not allowed for allow operations.
    /// @param sender Sender address.
    error SenderNotAllowed(address sender);

    /// @notice Returned if the pauser address is set to the zero address.
    error InvalidNullPauser();

    /// @custom:storage-location erc7201:fhevm.storage.ACL
    struct ACLStorage {
        mapping(bytes32 handle => mapping(address account => bool isAllowed)) persistedAllowedPairs;
        mapping(bytes32 handle => bool isAllowedForDecryption) allowedForDecryption;
        mapping(address account => mapping(address delegatee => mapping(address contractAddress => bool isDelegate))) delegates;
        address pauser;
    }

    /// @notice Name of the contract.
    string private constant CONTRACT_NAME = "ACL";

    /// @notice Major version of the contract.
    uint256 private constant MAJOR_VERSION = 0;

    /// @notice Minor version of the contract.
    uint256 private constant MINOR_VERSION = 2;

    /// @notice Patch version of the contract.
    uint256 private constant PATCH_VERSION = 0;

    /// @notice FHEVMExecutor address.
    address private constant fhevmExecutorAddress = fhevmExecutorAdd;

    /// @notice maximum length of contractAddresses array during delegation.
    uint256 private constant MAX_NUM_CONTRACT_ADDRESSES = 10;

    /// Constant used for making sure the version number used in the `reinitializer` modifier is
    /// identical between `initializeFromEmptyProxy` and the `reinitializeVX` method
    uint64 private constant REINITIALIZER_VERSION = 3;

    /// keccak256(abi.encode(uint256(keccak256("fhevm.storage.ACL")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ACLStorageLocation = 0xa688f31953c2015baaf8c0a488ee1ee22eb0e05273cc1fd31ea4cbee42febc00;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice  Initializes the contract.
     * @param initialPauser Pauser address
     */
    /// @custom:oz-upgrades-validate-as-initializer
    function initializeFromEmptyProxy(
        address initialPauser
    ) public virtual onlyFromEmptyProxy reinitializer(REINITIALIZER_VERSION) {
        __Ownable_init(owner());
        __Pausable_init();

        if (initialPauser == address(0)) {
            revert InvalidNullPauser();
        }

        ACLStorage storage $ = _getACLStorage();
        $.pauser = initialPauser;
    }

    /**
     * @notice Re-initializes the contract from V1, adding new storage variable pauser.
     * @param initialPauser Pauser address
     */
    /// @custom:oz-upgrades-unsafe-allow missing-initializer-call
    /// @custom:oz-upgrades-validate-as-initializer
    function reinitializeV2(address initialPauser) public virtual reinitializer(REINITIALIZER_VERSION) {
        if (initialPauser == address(0)) {
            revert InvalidNullPauser();
        }

        ACLStorage storage $ = _getACLStorage();
        $.pauser = initialPauser;
    }

    /**
     * @notice Allows the use of `handle` for the address `account`.
     * @dev The caller must be allowed to use `handle` for allow() to succeed. If not, allow() reverts.
     * @param handle Handle.
     * @param account Address of the account.
     */
    function allow(bytes32 handle, address account) public virtual whenNotPaused {
        ACLStorage storage $ = _getACLStorage();
        if (!isAllowed(handle, msg.sender)) {
            revert SenderNotAllowed(msg.sender);
        }
        $.persistedAllowedPairs[handle][account] = true;
        emit Allowed(msg.sender, account, handle);
    }

    /**
     * @notice Allows a list of handles to be decrypted.
     * @param handlesList List of handles.
     */
    function allowForDecryption(bytes32[] memory handlesList) public virtual whenNotPaused {
        uint256 lenHandlesList = handlesList.length;
        if (lenHandlesList == 0) {
            revert HandlesListIsEmpty();
        }

        ACLStorage storage $ = _getACLStorage();
        for (uint256 k = 0; k < lenHandlesList; k++) {
            bytes32 handle = handlesList[k];
            if (!isAllowed(handle, msg.sender)) {
                revert SenderNotAllowed(msg.sender);
            }
            $.allowedForDecryption[handle] = true;
        }
        emit AllowedForDecryption(msg.sender, handlesList);
    }

    /**
     * @notice Allows the use of `handle` by address `account` for this transaction.
     * @dev The caller must be allowed to use `handle` for allowTransient() to succeed.
     * If not, allowTransient() reverts. The Coprocessor contract can always `allowTransient`, contrarily to `allow`.
     * @param handle Handle.
     * @param account Address of the account.
     */
    function allowTransient(bytes32 handle, address account) public virtual whenNotPaused {
        if (msg.sender != fhevmExecutorAddress) {
            if (!isAllowed(handle, msg.sender)) {
                revert SenderNotAllowed(msg.sender);
            }
        }
        bytes32 key = keccak256(abi.encodePacked(handle, account));
        assembly {
            tstore(key, 1)
            let length := tload(0)
            let lengthPlusOne := add(length, 1)
            tstore(lengthPlusOne, key)
            tstore(0, lengthPlusOne)
        }
    }

    /**
     * @notice Delegates the access of handles in the context of account abstraction for issuing
     * reencryption requests from a smart contract account.
     * @param delegatee Delegatee address.
     * @param contractAddresses Contract addresses.
     */
    function delegateAccount(address delegatee, address[] memory contractAddresses) public virtual whenNotPaused {
        uint256 lengthContractAddresses = contractAddresses.length;
        if (lengthContractAddresses == 0) {
            revert ContractAddressesIsEmpty();
        }
        if (lengthContractAddresses > MAX_NUM_CONTRACT_ADDRESSES) {
            revert ContractAddressesMaxLengthExceeded();
        }

        ACLStorage storage $ = _getACLStorage();
        for (uint256 k = 0; k < lengthContractAddresses; k++) {
            if (contractAddresses[k] == msg.sender) {
                revert SenderCannotBeContractAddress(contractAddresses[k]);
            }
            if ($.delegates[msg.sender][delegatee][contractAddresses[k]]) {
                revert AlreadyDelegated(delegatee, contractAddresses[k]);
            }
            $.delegates[msg.sender][delegatee][contractAddresses[k]] = true;
        }

        emit NewDelegation(msg.sender, delegatee, contractAddresses);
    }

    /**
     * @notice Revokes delegated access of handles in the context of account abstraction for issuing
     * reencryption requests from a smart contract account.
     * @param delegatee Delegatee address.
     * @param contractAddresses Contract addresses.
     */
    function revokeDelegation(address delegatee, address[] memory contractAddresses) public virtual whenNotPaused {
        uint256 lengthContractAddresses = contractAddresses.length;
        if (lengthContractAddresses == 0) {
            revert ContractAddressesIsEmpty();
        }

        ACLStorage storage $ = _getACLStorage();

        for (uint256 k = 0; k < lengthContractAddresses; k++) {
            if (!$.delegates[msg.sender][delegatee][contractAddresses[k]]) {
                revert NotDelegatedYet(delegatee, contractAddresses[k]);
            }
            $.delegates[msg.sender][delegatee][contractAddresses[k]] = false;
        }

        emit RevokedDelegation(msg.sender, delegatee, contractAddresses);
    }

    /**
     * @dev Triggers stopped state.
     * Only owner or pauser addresses can pause.
     * The contract must not be paused.
     */
    function pause() external virtual {
        if (msg.sender != getPauser()) {
            revert NotPauser(msg.sender);
        }

        _pause();
    }

    /**
     * @dev Returns to normal state.
     * Only owner can unpause.
     * The contract must be paused.
     */
    function unpause() external virtual onlyOwner {
        _unpause();
    }

    /**
     * @notice Updates the pauser address.
     * @dev The new pauser address must not be the zero address.
     * @param newPauser New pauser address.
     * @dev This function can only be called by the owner when the contract is not paused.
     */
    function updatePauser(address newPauser) external virtual onlyOwner whenNotPaused {
        if (newPauser == address(0)) {
            revert InvalidNullPauser();
        }

        ACLStorage storage $ = _getACLStorage();

        $.pauser = newPauser;
        emit UpdatePauser(newPauser);
    }

    /**
     * @notice Returns whether the delegatee is allowed to access the handle.
     * @param delegatee Delegatee address.
     * @param handle Handle.
     * @param contractAddress Contract address.
     * @param account Address of the account.
     * @return isAllowed Whether the handle can be accessed.
     */
    function allowedOnBehalf(
        address delegatee,
        bytes32 handle,
        address contractAddress,
        address account
    ) public view virtual returns (bool) {
        ACLStorage storage $ = _getACLStorage();
        return
            $.persistedAllowedPairs[handle][account] &&
            $.persistedAllowedPairs[handle][contractAddress] &&
            $.delegates[account][delegatee][contractAddress];
    }

    /**
     * @notice Checks whether the account is allowed to use the handle in the
     * same transaction (transient).
     * @param handle Handle.
     * @param account Address of the account.
     * @return isAllowedTransient Whether the account can access transiently the handle.
     */
    function allowedTransient(bytes32 handle, address account) public view virtual returns (bool) {
        bool isAllowedTransient;
        bytes32 key = keccak256(abi.encodePacked(handle, account));
        assembly {
            isAllowedTransient := tload(key)
        }
        return isAllowedTransient;
    }

    /**
     * @notice Getter function for the FHEVMExecutor contract address.
     * @return fhevmExecutorAddress Address of the FHEVMExecutor.
     */
    function getFHEVMExecutorAddress() public view virtual returns (address) {
        return fhevmExecutorAddress;
    }

    /**
     * @notice Returns whether the account is allowed to use the `handle`, either due to
     * allowTransient() or allow().
     * @param handle Handle.
     * @param account Address of the account.
     * @return isAllowed Whether the account can access the handle.
     */
    function isAllowed(bytes32 handle, address account) public view virtual returns (bool) {
        return allowedTransient(handle, account) || persistAllowed(handle, account);
    }

    /**
     * @notice Checks whether a handle is allowed for decryption.
     * @param handle Handle.
     * @return isAllowed Whether the handle is allowed for decryption.
     */
    function isAllowedForDecryption(bytes32 handle) public view virtual returns (bool) {
        ACLStorage storage $ = _getACLStorage();
        return $.allowedForDecryption[handle];
    }

    /**
     * @notice Returns `true` if address `a` is allowed to use `c` and `false` otherwise.
     * @param handle Handle.
     * @param account Address of the account.
     * @return isAllowed Whether the account can access the handle.
     */
    function persistAllowed(bytes32 handle, address account) public view virtual returns (bool) {
        ACLStorage storage $ = _getACLStorage();
        return $.persistedAllowedPairs[handle][account];
    }

    /**
     * @notice Returns the address of the pauser.
     * @return pauser Address of the pauser.
     */
    function getPauser() public view virtual returns (address pauser) {
        ACLStorage storage $ = _getACLStorage();
        return $.pauser;
    }

    /**
     * @dev This function removes the transient allowances, which could be useful for integration with
     * Account Abstraction when bundling several UserOps calling the FHEVMExecutor Coprocessor.
     */
    function cleanTransientStorage() external virtual {
        assembly {
            let length := tload(0)
            tstore(0, 0)
            let lengthPlusOne := add(length, 1)
            for {
                let i := 1
            } lt(i, lengthPlusOne) {
                i := add(i, 1)
            } {
                let handle := tload(i)
                tstore(i, 0)
                tstore(handle, 0)
            }
        }
    }

    /**
     * @notice Getter for the name and version of the contract.
     * @return string Name and the version of the contract.
     */
    function getVersion() external pure virtual returns (string memory) {
        return
            string(
                abi.encodePacked(
                    CONTRACT_NAME,
                    " v",
                    Strings.toString(MAJOR_VERSION),
                    ".",
                    Strings.toString(MINOR_VERSION),
                    ".",
                    Strings.toString(PATCH_VERSION)
                )
            );
    }

    /**
     * @dev Should revert when `msg.sender` is not authorized to upgrade the contract.
     */
    function _authorizeUpgrade(address _newImplementation) internal virtual override onlyOwner {}

    /**
     * @dev Returns the ACL storage location.
     */
    function _getACLStorage() internal pure returns (ACLStorage storage $) {
        assembly {
            $.slot := ACLStorageLocation
        }
    }
}
