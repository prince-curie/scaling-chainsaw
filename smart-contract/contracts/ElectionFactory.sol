// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Election.sol";

/// @title Election factory contract
/// @author Team-d
/// @notice The contract deploys the election contract while keeping metadata about the contract

contract ElectionFactory {
    address public owner;

    struct ElectionDetails {
        uint256 id;
        Election electionAddress;
        string position;
        string[] contestants;
        uint256 createdAt;
        string status;
    }
    ElectionDetails[] elections;
    
    /// @notice Number of elections conducted
    uint256 public electionCount;

    /// @notice Election status
    string constant private PENDING = 'Pending';
    string constant private STARTED = 'Started';
    string constant private ENDED = 'Ended';
    string constant private RESULTS_READY = 'Results ready';

    event SetOwner(address indexed oldOwner, address indexed newOwner);
    event CreateElection(uint256 id, Election election, address indexed creator, string position);

    error NotAuthorised(address caller);
    
    constructor() {
        owner = msg.sender;
    }

    /// @dev Ensures that only the owner can call a function
    modifier onlyOwner() {
        if(msg.sender != owner) {
            revert NotAuthorised(msg.sender);
        }
        _;
    }

    /// @dev Sets a new owner
    function setOwner(address _owner) public onlyOwner {
        owner = _owner;

        emit SetOwner(msg.sender, _owner);
    }

    /// @dev Deploys a new election smart contract and stores the details.
    function createElection(string memory _position, string[] memory _contestants, address[] memory _contestantsAddress) external onlyOwner returns(address) {
        uint256 count = electionCount;
        count++;

        Election election = new Election(msg.sender, _position, _contestants.length, _contestants, _contestantsAddress);
        
        ElectionDetails memory electionDetail;

        electionDetail.id = count;
        electionDetail.electionAddress = election;
        electionDetail.position = _position;
        electionDetail.contestants = _contestants;
        electionDetail.createdAt = block.timestamp;
        electionDetail.status = PENDING;

        elections.push(electionDetail);

        electionCount = count;

        emit CreateElection(count, election, msg.sender, _position);
        return address(election);
    }

    function allElections() public view returns(ElectionDetails[] memory){
        return elections;
    }
}