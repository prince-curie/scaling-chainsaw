//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import '@openzeppelin/contracts/security/Pausable.sol';
import './ElectionAccessControl.sol';

contract Election is Pausable, ElectionAccessControl{


    string position;
    uint noOfpartcipate;
    address[] participateAddress;
    bool electionStatus;
    bool resultStatus;

    error NoOfParticatantNotMatchingParticipateId();
    error AlreadyVoted();
    error ResultNotYetRelease();

    struct Candidates{
        address candidatesAddress;
        uint voteCount;
    }

    mapping(address => bool) voterStatus;
    mapping(address => Candidates) candidates;
    mapping(address => uint) voteCount;
    Candidates[] results;

    

    


    constructor(string memory _position, uint _noOfParticipants, address[] memory _participantsAddress) ElectionAccessControl(msg.sender){
        if(_noOfParticipants != _participantsAddress.length) revert NoOfParticatantNotMatchingParticipateId();
        position = _position;
        noOfpartcipate = _noOfParticipants;
        participateAddress = _participantsAddress;
        for(uint i=0; i < _participantsAddress.length;i++){
           Candidates storage _candidates = candidates[_participantsAddress[i]];
           _candidates.candidatesAddress = _participantsAddress[i];
        }
    }


    function setupTeachers(address[] memory _teacher) public returns(bool){
        for(uint i = 0; i < _teacher.length; i++){
            _grantRole(TEACHER_ROLE, _teacher[i]);
        }
        return true;
    }

    function registerStudent(address[] memory _student) public returns(bool){
        for(uint i = 0; i < _student.length; i++){
            _grantRole(STUDENT_ROLE, _student[i]);
        }
        return true;
    }

    function setupBOD(address[] memory _Bod) public returns(bool){
        for(uint i = 0; i < _Bod.length; i < i++){
            _grantRole(DIRECTOR_ROLE, _Bod[i]);
        }
        return true;
    }

    function vote(address _participantsAddress) public whenNotPaused returns(bool){
        if(voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint currentVote = voteCount[_participantsAddress];
        voteCount[_participantsAddress] = currentVote + 1;
        voterStatus[msg.sender] = true;
        return true;
    }

    function compileResult() public returns(Candidates[] memory){
        for(uint i = 0; i < participateAddress.length; i++){
            Candidates storage _candidates = candidates[participateAddress[i]];
            _candidates.voteCount = voteCount[participateAddress[i]];
            results.push(_candidates);
        }
        return results;
    }

    function showResult() public returns(bool){
        resultStatus = true;
        return true;
    }

    function result() public view returns(Candidates[] memory){
       // if(resultStatus == false) revert ResultNotYetRelease();
        return results;
    }
}
