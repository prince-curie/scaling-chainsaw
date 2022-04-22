//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/Pausable.sol';
import './ElectionAccessControl.sol';
import "./interfaces/IElectionFactory.sol";

contract Election is Pausable, ElectionAccessControl{

    string position;
    uint256 noOfpartcipate;
    string[] contestantsName;
    bool electionStatus;
    bool resultStatus;

    /// @notice Election status
    string constant private PENDING = 'Pending';
    string constant private STARTED = 'Started';
    string constant private ENDED = 'Ended';
    string constant private RESULTS_READY = 'Results ready';

    uint256 immutable index;

    address immutable electionFactory;

    error NoOfParticatantNotMatchingParticipateName();
    error AlreadyVoted();
    error ResultNotYetRelease();
    error AccessDenied();

    struct Candidates {
        string candidatesName;
        uint256 voteCount;
    }

    mapping(address => bool) voterStatus;
    mapping(string => Candidates) candidates;
    mapping(string => uint256) voteCount;
    Candidates[] results;

    /// ======================= MODIFIERS =================================
    ///@notice modifier to specify that election has not ended
    modifier electionIsStillOn() {
        require(!Ended, "Sorry, the Election has ended!");
        _;
    }
    ///@notice modifier to check that election is active
    modifier electionIsActive() {
        require(Active, "Election has not begun!");
        _;
    }
    
    modifier allRole() {
        require(
            hasRole(CHAIRMAN_ROLE, msg.sender) == true || 
            hasRole(TEACHER_ROLE, msg.sender) == true || 
            hasRole(STUDENT_ROLE, msg.sender) == true || 
            hasRole(DIRECTOR_ROLE, msg.sender) == true, "ACCESS DENIED");
        _;
    }

    modifier onlyChairmanAndTeacherRole () {
        require(
            hasRole(CHAIRMAN_ROLE, msg.sender) == true || 
            hasRole(TEACHER_ROLE, msg.sender) == true, 
            "ACCESS FOR TEACHER(s) AND CHAIRMAN ONLY" );
        _;
    }

    modifier onlyChairmanAndTeacherAndDirectorRole() {
        require(
            hasRole(CHAIRMAN_ROLE, msg.sender) == true || 
            hasRole(TEACHER_ROLE, msg.sender) == true || 
            hasRole(DIRECTOR_ROLE,msg.sender) == true, 
            "ACCESS FOR TEACHER(s) AND CHAIRMAN ONLY" );
        _;
    }

    ///======================= EVENTS ==============================
    ///@notice event to emit when election has ended
    event ElectionEnded(uint256[] _winnerIds, uint256 _winnerVoteCount);
    event SetUpTeacher(address[] teacher);
    event RegisterTeacher(address[] student);
    event SetUpDirector(address[] director);
    event Vote(string candidates, address voter);

    constructor(
        address _owner,
        string memory _position,
        uint256 _noOfParticipants,
        string[] memory _contestants,
        uint256 _index, 
        address _electionFactory
    ) ElectionAccessControl(_owner) {
        if (_noOfParticipants != _contestants.length)
            revert NoOfParticatantNotMatchingParticipateName();

        position = _position;
        noOfpartcipate = _noOfParticipants;
        contestantsName = _contestants;
        index = _index;
        electionFactory = _electionFactory;

        for (uint256 i = 0; i < _contestants.length; i++) {
            Candidates storage _candidates = candidates[_contestants[i]];
            _candidates.candidatesName = _contestants[i];
        }
    }


/// @notice setup teachers
/// @dev only CHAIRMAN_ROLE can call this method
/// @param _teacher array of address
    function setupTeachers(
        address[] memory _teacher)
        onlyRole(CHAIRMAN_ROLE)
        public returns(bool){
        for(uint i = 0; i < _teacher.length; i++){
            grantRole(TEACHER_ROLE, _teacher[i]);
        }
        emit SetUpTeacher(_teacher);
        return true;
    }


    /// @notice registers student
    /// @dev only TEACHER_ROLE can call this method
    /// @param _student array of address
    function registerStudent(address[] memory _student)
        public 
        onlyRole(TEACHER_ROLE) 
        returns(bool)
    {
        for(uint i = 0; i < _student.length; i++){
            grantRole(STUDENT_ROLE, _student[i]);
        }
        emit registerStudent(_student);
        return true;
        
    }


    /// @notice setup directors
    /// @dev only CHAIRMAN_ROLE can call this method
    /// @param _Bod array of address
    function setupBOD(address[] memory _Bod) 
        public 
        onlyRole(CHAIRMAN_ROLE)
        returns(bool)
    {
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
    function vote(string memory _participantsName)
        public allRole()  
        whenNotPaused 
        returns(bool)
    {
        if(voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint currentVote = voteCount[_participantsName];
        voteCount[_participantsName] = currentVote + 1;
        voterStatus[msg.sender] = true;

        emit Vote(_participantsName, msg.sender);
        return true;
    }



    /// @notice for compiling vote
    /// @dev only CHAIRMAN_ROLE and TEACHER_ROLE can call this function
    function compileResult() 
        public 
        onlyChairmanAndTeacherRole() 
        returns(Candidates[] memory)
    {
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

        _upStatusOnFactory(RESULTS_READY);

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
    function privateViewResult()  public view onlyChairmanAndTeacherAndDirectorRole()returns(Candidates[] memory){
        return results;
    }
}
