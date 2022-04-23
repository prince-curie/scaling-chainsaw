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
        address electionAddress;
        string position;
        string[] contestants;
        uint256 createdAt;
        string status;
    }
    ElectionDetails[] private elections;
    
    /// @notice Number of elections conducted
    uint256 public electionCount;

    /// @notice Election status
    string constant private PENDING = 'Pending';
    string constant private STARTED = 'Started';
    string constant private ENDED = 'Ended';
    string constant private RESULTS_READY = 'Results ready';

    event SetOwner(address indexed oldOwner, address indexed newOwner);
    event CreateElection(uint256 id, address electionAddress, address indexed creator, string position);
    event UpdateElectionStatus(string status, address electionAddress);


    error NotAuthorised(address caller);
    error UnAuthorizedElectionContract(address electionContract);
    error BadStatusRequest(string status);
    
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
    function createElection(string memory _position, string[] memory _contestants) external onlyOwner{
        uint256 count = electionCount;
        count++;

        Election election = new Election(msg.sender, _position, _contestants.length, _contestants, count, address(this));
        
        ElectionDetails memory electionDetail;

        electionDetail.id = count;
        electionDetail.electionAddress = address(election);
        electionDetail.position = _position;
        electionDetail.contestants = _contestants;
        electionDetail.createdAt = block.timestamp;
        electionDetail.status = PENDING;

        elections.push(electionDetail); 

        electionCount = count;

        emit CreateElection(count, address(election), msg.sender, _position);
    }

    /// @dev Called from the election contract to update the status of an election
    function updateElectionStatus(uint256 _electionId, string memory _status) external {
        ElectionDetails memory electionDetails = elections[_electionId - 1];

        if(electionDetails.electionAddress != msg.sender) {
            revert UnAuthorizedElectionContract(msg.sender);
        }

        electionDetails.status = _status;

        elections[_electionId - 1] = electionDetails;

        emit UpdateElectionStatus(_status, electionDetails.electionAddress);
    }
    
    /// @dev Sends a list of election parameters
    function getElections (uint256 _start, uint256 _length) 
        external 
        view 
        returns(
            address [] memory electionAddress, 
            string [] memory position,
            uint256 [] memory createdAt,
            string[] memory status 
        )
    {
        require(_start > 0, "Caller cannot start from zero start from one");
        uint256 electionsLength = elections.length;
        uint256 end = _start + _length;

        if(electionsLength < end){
            _length = (electionsLength - _start) + 1;
            end = electionsLength + 1;
        }

        electionAddress = new address[] (_length);
        position = new string[] (_length);
        createdAt = new uint256[](_length);
        status = new string[] (_length);

        uint256 counter = 0;

        for (uint256 i = _start; i < end; i++){
            ElectionDetails memory election = elections[i-1];

            electionAddress[counter] = election.electionAddress;
            position[counter] = election.position;
            createdAt[counter] = election.createdAt;
            status[counter] = election.status;

            counter++;
        }

        return (electionAddress, position, createdAt, status);
    }

}

