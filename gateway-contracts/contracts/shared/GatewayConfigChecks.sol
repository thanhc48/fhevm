// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { gatewayConfigAddress } from "../../addresses/GatewayAddresses.sol";
import "../interfaces/IGatewayConfig.sol";
import "../libraries/HandleOps.sol";

/**
 * @title GatewayConfig Checks
 * @dev Base contract that provides modifiers that checks proper registration in the GatewayConfig contract
 */
abstract contract GatewayConfigChecks {
    /// @notice The address of the GatewayConfig contract
    IGatewayConfig private constant _GATEWAY_CONFIG = IGatewayConfig(gatewayConfigAddress);

    /// @notice Checks if the sender is a coprocessor transaction sender.
    modifier onlyCoprocessorTxSender() {
        _GATEWAY_CONFIG.checkIsCoprocessorTxSender(msg.sender);
        _;
    }

    /// @notice Checks if the sender is a KMS transaction sender.
    modifier onlyKmsTxSender() {
        _GATEWAY_CONFIG.checkIsKmsTxSender(msg.sender);
        _;
    }

    /// @dev Check that the chain ID corresponds to a registered host chain.
    modifier onlyRegisteredHostChain(uint256 chainId) {
        _GATEWAY_CONFIG.checkHostChainIsRegistered(chainId);
        _;
    }

    /// @dev Check that the chain ID extracted from the handle corresponds to a registered host chain.
    modifier onlyHandleFromRegisteredHostChain(bytes32 handle) {
        _GATEWAY_CONFIG.checkHostChainIsRegistered(HandleOps.extractChainId(handle));
        _;
    }
}
