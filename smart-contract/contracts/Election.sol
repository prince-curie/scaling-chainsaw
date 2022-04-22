//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import '@openzeppelin/contracts/security/Pausable.sol';
import './ElectionAccessControl.sol';

contract Election is Pausable, ElectionAccessControl{


    string position;
    uint noOfpartcipate;
    string[] contestantsName;
    bool electionStatus;
    bool resultStatus;

    error NoOfParticatantNotMatchingParticipateName();
    error AlreadyVoted();
    error ResultNotYetRelease();

    struct Candidates{
        string candidatesName;
        uint voteCount;
    }

    mapping(address => bool) voterStatus;
    mapping(string => Candidates) candidates;
    mapping(string => uint) voteCount;
    Candidates[] results;


    constructor(address _owner,string memory _position, uint _noOfParticipants, string[] memory _contestants) ElectionAccessControl(_owner){
        if(_noOfParticipants != _contestants.length) revert NoOfParticatantNotMatchingParticipateName();
        position = _position;
        noOfpartcipate = _noOfParticipants;
        contestantsName = _contestants;

        for(uint i=0; i < _contestants.length;i++){
           Candidates storage _candidates = candidates[_contestants[i]];
           _candidates.candidatesName = _contestants[i];
        }
    }


    function setupTeachers(address[] memory _teacher) onlyRole(CHAIRMAN_ROLE) public returns(bool){
        for(uint i = 0; i < _teacher.length; i++){
            _grantRole(TEACHER_ROLE, _teacher[i]);
        }
        return true;
    }

    function registerStudent(address[] memory _student) onlyRole(CHAIRMAN_ROLE) onlyRole(TEACHER_ROLE) public returns(bool){
        for(uint i = 0; i < _student.length; i++){
            _grantRole(STUDENT_ROLE, _student[i]);
        }
        return true;
    }

    function setupBOD(address[] memory _Bod) onlyRole(CHAIRMAN_ROLE) public returns(bool){
        for(uint i = 0; i < _Bod.length; i < i++){
            _grantRole(DIRECTOR_ROLE, _Bod[i]);
        }
        return true;
    }

    function vote(string memory _participantsName) public onlyRole(STUDENT_ROLE) onlyRole(TEACHER_ROLE) onlyRole(CHAIRMAN_ROLE) onlyRole(DIRECTOR_ROLE) whenNotPaused returns(bool){
        if(voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint currentVote = voteCount[_participantsName];
        voteCount[_participantsName] = currentVote + 1;
        voterStatus[msg.sender] = true;
        return true;
    }

    function compileResult() public onlyRole(TEACHER_ROLE) onlyRole(CHAIRMAN_ROLE) returns(Candidates[] memory){
        for(uint i = 0; i < contestantsName.length; i++){
            Candidates storage _candidates = candidates[contestantsName[i]];
            _candidates.voteCount = voteCount[contestantsName[i]];
            results.push(_candidates);
        }
        return results;
    }

    function showResult() onlyRole(CHAIRMAN_ROLE) public returns(bool){
        resultStatus = true;
        return true;
    }

    function result() public view returns(Candidates[] memory){
        if(resultStatus == false) revert ResultNotYetRelease();
        return results;
    }

    function privateViewResult() onlyRole(TEACHER_ROLE) onlyRole(CHAIRMAN_ROLE) public view returns(Candidates[] memory){
        return results;
    }
}
