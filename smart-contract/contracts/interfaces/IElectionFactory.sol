// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/// @title Election factory Interface
/// @author Team-d
/// @notice The contract deploys the election contract while keeping metadata about the contract

interface IElectionFactory {
    function upStateElectionStatus(uint256 _electionId, string memory _status) external;
}