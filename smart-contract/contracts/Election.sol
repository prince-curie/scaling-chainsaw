//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/Pausable.sol';
import './ElectionAccessControl.sol';
import "./interfaces/IElectionFactory.sol";

contract Election is Pausable, ElectionAccessControl{

    string position;
    
    string[] public contestantsName;
    uint256 public noOfParticipants;

    /// @dev Timestamps 
    uint256 public startAt;
    uint256 public endAt;
    uint256 public resultReadyAt;

    /// @notice Election status
    string constant private STARTED = 'Started';
    string constant private ENDED = 'Ended';
    string constant private RESULTS_READY = 'Results ready';

    uint256 immutable index;
    address immutable electionFactory;

    error NoOfParticipantNotMatchingParticipantName();
    error AlreadyVoted();
    error ResultNotYetRelease();
    error AccessDenied();
    error VotingNotStarted();
    error VotingEnd();
    error ResultCompiled();
    error ElectionOngoingOrNotStarted();
    error ResultNotCompiled();

    struct Candidates {
        string candidatesName;
        uint256 voteCount;
    }
    mapping(string => Candidates) candidates;

    mapping(address => bool) public voterStatus;
    mapping(string => uint256) voteCount;
    Candidates[] results;

    /// ======================= MODIFIERS =================================
    ///@notice modifier to specify that election has not ended
    modifier electionHasEnded() {
        if(startAt < endAt) {
            revert VotingEnd();
        }
        _;
    }
    ///@notice modifier to check that election is active
    modifier electionIsActive() {
        if(startAt == 0) {
            revert VotingNotStarted();
        }
        _;
    }
    
    modifier allRole() {
        if(!hasRole(CHAIRMAN_ROLE, msg.sender) && 
            !hasRole(TEACHER_ROLE, msg.sender) && 
            !hasRole(STUDENT_ROLE, msg.sender) && 
            !hasRole(DIRECTOR_ROLE, msg.sender))
        {
            revert AccessDenied();
        }
        _;
    }

    modifier onlyChairmanAndTeacherRole () {
        if(
            !hasRole(CHAIRMAN_ROLE, msg.sender) && 
            !hasRole(TEACHER_ROLE, msg.sender)
        )
            revert AccessDenied();
        _;
    }

    modifier onlyChairmanAndTeacherAndDirectorRole() {
        if(
            !hasRole(CHAIRMAN_ROLE, msg.sender) && 
            !hasRole(TEACHER_ROLE, msg.sender) && 
            !hasRole(DIRECTOR_ROLE,msg.sender)
        )
            revert AccessDenied();
        _;
    }

    ///======================= EVENTS ==============================
    ///@notice event to emit when election has ended
    event ElectionEnded(uint256[] _winnerIds, uint256 _winnerVoteCount);
    event SetUpTeacher(address[] teacher);
    event RegisterTeacher(address[] student);
    event SetUpDirector(address[] director);
    event Vote(address voter);
    event StartVoting(uint256 startAt);
    event EndVoting(uint256 endAt);
    event SetUpBOD(address[] _Bod);
    event RegisterStudent(address[] _student);
    event CompileResult(address compiler);
    event ShowResult(address stakeholder, uint256 resultReadyAt);

    constructor(
        address _owner,
        string memory _position,
        uint256 _noOfParticipants,
        string[] memory _contestants,
        uint256 _index, 
        address _electionFactory
    ) ElectionAccessControl(_owner) {
        if (_noOfParticipants != _contestants.length)
            revert NoOfParticipantNotMatchingParticipantName();

        position = _position;
        noOfParticipants = _noOfParticipants;
        contestantsName = _contestants;
        index = _index;
        electionFactory = _electionFactory;
    }


/// @notice setup teachers
/// @dev only CHAIRMAN_ROLE can call this method
/// @param _teacher array of address
    function setupTeachers(address[] memory _teacher) onlyRole(CHAIRMAN_ROLE) external {
        for(uint i = 0; i < _teacher.length; i++){
            _grantRole(TEACHER_ROLE, _teacher[i]);
        }

        emit SetUpTeacher(_teacher);
    }

    /// @notice registers student
    /// @dev only TEACHER_ROLE can call this method
    /// @param _student array of address
    function registerStudent(address[] memory _student) external onlyRole(TEACHER_ROLE) {
        for(uint i = 0; i < _student.length; i++){
            _grantRole(STUDENT_ROLE, _student[i]);
        }

        emit RegisterStudent(_student);
    }


    /// @notice setup directors
    /// @dev only CHAIRMAN_ROLE can call this method
    /// @param _Bod array of address
    function setupBOD(address[] memory _Bod) external onlyRole(CHAIRMAN_ROLE) {
        for(uint i = 0; i < _Bod.length; i++){
            _grantRole(DIRECTOR_ROLE, _Bod[i]);
        }

        emit SetUpBOD(_Bod);
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     * - only CHAIRMAN_ROLE can call this method
     */
    function pause() external onlyRole(CHAIRMAN_ROLE) {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     * - only CHAIRMAN_ROLE can call this method
     */
    function unpause() external onlyRole(CHAIRMAN_ROLE) {
        _unpause();
    }

    /// @notice Ensures that voting begins
    function enableVoting() external onlyRole(CHAIRMAN_ROLE) {
        startAt = block.timestamp;

        _updateStatusOnFactory(STARTED);

        emit StartVoting(block.timestamp);
    }

    /// @notice for voting
    /// @dev allRole can call this function
    /// @param _participantsName a string
    function vote(string memory _participantsName)
        external 
        allRole 
        electionIsActive
        electionHasEnded
        whenNotPaused 
    {
        if(voterStatus[msg.sender]) revert AlreadyVoted();
        
        voteCount[_participantsName]++;

        voterStatus[msg.sender] = true;

        emit Vote(msg.sender);
    }

    function disableVoting() external onlyRole(CHAIRMAN_ROLE) {
        if(endAt == startAt)
            revert VotingNotStarted();

        endAt = block.timestamp;

        _updateStatusOnFactory(ENDED);

        emit EndVoting(block.timestamp);
    }

    /// @notice for compiling vote
    /// @dev only CHAIRMAN_ROLE and TEACHER_ROLE can call this function
    function compileResult() 
        external 
        onlyChairmanAndTeacherRole 
    {
        if(endAt <= startAt) 
            revert ElectionOngoingOrNotStarted();
        
        if(results.length > 0) 
            revert ResultCompiled();

        for(uint i = 0; i < contestantsName.length; i++){
            Candidates memory _candidates = candidates[contestantsName[i]];
        
            _candidates.voteCount = voteCount[contestantsName[i]];
        
            results.push(_candidates);
        }

        emit CompileResult(msg.sender);
    }


    /// @notice for making result public
    /// @dev allrole except STUDENT_ROLE can call this function
    function showResult() onlyChairmanAndTeacherAndDirectorRole external {
        if(results.length == 0) revert ResultNotCompiled();

        _updateStatusOnFactory(RESULTS_READY);

        resultReadyAt = block.timestamp;

        emit ShowResult(msg.sender, resultReadyAt);
    }

    /// @notice for viewing results
    /// @dev resultStatus must be true to view the result
    function result() external view returns(Candidates[] memory){
        if(resultReadyAt == 0) revert ResultNotYetRelease();
        
        return results;
    }

    /// @notice for privateViewing results
    /// @dev allRole except STUDENT_ROLE can call this method
    function privateViewResult() external view onlyChairmanAndTeacherAndDirectorRole returns(Candidates[] memory){
        return results;
    }

    /// @dev Makes call to the election factory to update the status of an election.
    function _updateStatusOnFactory(string memory _status) internal {
        IElectionFactory(electionFactory).updateElectionStatus(index, _status);
    }

}
