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
    error AccessDenied();

    struct Candidates{
        string candidatesName;
        uint voteCount;
    }

    mapping(address => bool) voterStatus;
    mapping(string => Candidates) candidates;
    mapping(string => uint) voteCount;
    Candidates[] results;

    modifier allRole() {
        require(hasRole(CHAIRMAN_ROLE, msg.sender) == true || hasRole(TEACHER_ROLE, msg.sender) == true || hasRole(STUDENT_ROLE, msg.sender) == true || hasRole(DIRECTOR_ROLE, msg.sender) == true, "ACCESS DENIED");
        _;
    }

    modifier onlyChairmanAndTeacherRole () {
        require(hasRole(CHAIRMAN_ROLE, msg.sender) == true || hasRole(TEACHER_ROLE, msg.sender) == true, "ACCESS FOR TEACHER(s) AND CHAIRMAN ONLY" );
        _;
    }

    modifier onlyChairmanAndTeacherAndDirectorRole() {
        require(hasRole(CHAIRMAN_ROLE, msg.sender) == true || hasRole(TEACHER_ROLE, msg.sender) == true || hasRole(DIRECTOR_ROLE,msg.sender) == true, "ACCESS FOR TEACHER(s) AND CHAIRMAN ONLY" );
        _;
    }

    event SetUpTeacher(address[] teacher);
    event RegisterTeacher(address[] student);
    event SetUpDirector(address[] director);
    event Vote(string candidates, address voter);

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


/// @notice setup teachers
/// @dev only CHAIRMAN_ROLE can call this method
/// @param _teacher array of address
    function setupTeachers(address[] memory _teacher) onlyRole(CHAIRMAN_ROLE) public returns(bool){
        for(uint i = 0; i < _teacher.length; i++){
            grantRole(TEACHER_ROLE, _teacher[i]);
        }
        emit SetUpTeacher(_teacher);
        return true;
    }

    /// @notice registers student
    /// @dev only TEACHER_ROLE can call this method
    /// @param _student array of address
    function registerStudent(address[] memory _student) onlyRole(TEACHER_ROLE) public returns(bool){
        for(uint i = 0; i < _student.length; i++){
            grantRole(STUDENT_ROLE, _student[i]);
        }
        emit registerStudent(_student);
        return true;
        
    }


    /// @notice setup directors
    /// @dev only CHAIRMAN_ROLE can call this method
    /// @param _Bod array of address
    function setupBOD(address[] memory _Bod) onlyRole(CHAIRMAN_ROLE) public returns(bool){
        for(uint i = 0; i < _Bod.length; i < i++){
            grantRole(DIRECTOR_ROLE, _Bod[i]);
        }
        emit setupBOD(_Bod);
        return true;
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     * - only CHAIRMAN_ROLE can call this method
     */
    function pause() external onlyRole(CHAIRMAN_ROLE) returns(bool){
        _pause();
        return true;
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     * - only CHAIRMAN_ROLE can call this method
     */
    function unpause() external onlyRole(CHAIRMAN_ROLE) returns(bool){
        _unpause();
        return true;
    }


    /// @notice for voting
    /// @dev allRole can call this function
    /// @param _participantsName a string
    function vote(string memory _participantsName) public allRole()  whenNotPaused returns(bool){
        if(voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint currentVote = voteCount[_participantsName];
        voteCount[_participantsName] = currentVote + 1;
        voterStatus[msg.sender] = true;

        emit Vote(_participantsName, msg.sender);
        return true;
    }


    /// @notice for compiling vote
    /// @dev only CHAIRMAN_ROLE and TEACHER_ROLE can call this function
    function compileResult() public onlyChairmanAndTeacherRole() returns(Candidates[] memory){
        for(uint i = 0; i < contestantsName.length; i++){
            Candidates storage _candidates = candidates[contestantsName[i]];
            _candidates.voteCount = voteCount[contestantsName[i]];
            results.push(_candidates);
        }
        return results;
    }

    /// @notice for making result public
    /// @dev allrole except STUDENT_ROLE can call this function
    function showResult() onlyChairmanAndTeacherAndDirectorRole() public returns(bool){
        resultStatus = true;
        return true;
    }

    /// @notice for viewing results
    /// @dev resultStatus must be true to view the result
    function result() public view returns(Candidates[] memory){
        if(resultStatus == false) revert ResultNotYetRelease();
        return results;
    }

    /// @notice for privateViewing results
    /// @dev allRole except STUDENT_ROLE can call this method
    function privateViewResult() onlyChairmanAndTeacherAndDirectorRole() public  view returns(Candidates[] memory){
        return results;
    }
}
