//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import '@openzeppelin/contracts/security/Pausable.sol';

contract Election is Pausable{


    string position;
    uint noOfpartcipate;
    string[] participateAddress;
    bool electionStatus;
    bool resultStatus;

    error NoOfParticatantNotMatchingParticipateId();
    error AlreadyVoted();
    error ResultNotYetRelease();

    mapping(address => bool) voterStatus;
    mapping(string => uint) voteCount;
    uint[] results;


    constructor(address _owner, string memory _position, uint _noOfParticipants, string[] memory _contestants, uint256 id) {
        if(_noOfParticipants != _contestants.length) revert NoOfParticatantNotMatchingParticipateId();
        position = _position;
        noOfpartcipate = _noOfParticipants;
        participateAddress = _contestants;
    }


    function setupTeachers(address[] memory _teacher) public returns(bool){
        // to do 
    }

    function registerStudent(address[] memory _student) public returns(bool){

    }

    function setupBOD(address[] memory _Bod) public returns(bool){

    }

    function vote(string memory _participantsAddress) public whenNotPaused returns(bool){
        if(voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint currentVote = voteCount[_participantsAddress];
        voteCount[_participantsAddress] = currentVote + 1;
        voterStatus[msg.sender] = true;
        return true;
    }

    function compileResult() public returns(uint[] memory){
        for(uint i = 0; i < participateAddress.length; i++){
            results.push(voteCount[participateAddress[i]]);
        }
        return results;
    }

    function showResult() public returns(bool){
        resultStatus = true;
        return true;
    }

    function result() public view returns(uint[] memory){
       // if(resultStatus == false) revert ResultNotYetRelease();
        return results;
    }
}
