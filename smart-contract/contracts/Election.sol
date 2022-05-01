//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/security/Pausable.sol';
import './ElectionAccessControl.sol';
import "./interfaces/IElectionFactory.sol";

contract Election is Pausable, ElectionAccessControl{

    string position;
    
    string[] public contestantsName;
    bool public resultStatus;
    uint256 public noOfpartcipate;

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

    error NoOfParticatantNotMatchingParticipateName();
    error AlreadyVoted();
    error ResultNotYetRelease();
    error AccessDenied();
    error VotingNotAllowed();
    error VotingNotStarted();
    error VotingEnd();

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
        // require(
            // hasRole(CHAIRMAN_ROLE, msg.sender) == true || 
            // hasRole(TEACHER_ROLE, msg.sender) == true || 
            // hasRole(STUDENT_ROLE, msg.sender) == true || 
            // hasRole(DIRECTOR_ROLE, msg.sender) == true, "ACCESS DENIED");
        if(hasRole(CHAIRMAN_ROLE, msg.sender) != true && 
            hasRole(TEACHER_ROLE, msg.sender) != true && 
            hasRole(STUDENT_ROLE, msg.sender) != true && 
            hasRole(DIRECTOR_ROLE, msg.sender) != true)
        {
            revert AccessDenied();
        }
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
    function setupTeachers(address[] memory _teacher) onlyRole(CHAIRMAN_ROLE) public {
        for(uint i = 0; i < _teacher.length; i++){
            grantRole(TEACHER_ROLE, _teacher[i]);
        }

        emit SetUpTeacher(_teacher);
        
        // return true;
    }

    /// @notice registers student
    /// @dev only TEACHER_ROLE can call this method
    /// @param _student array of address
    function registerStudent(address[] memory _student) public  onlyRole(TEACHER_ROLE) {
        for(uint i = 0; i < _student.length; i++){
            grantRole(STUDENT_ROLE, _student[i]);
        }

        emit RegisterStudent(_student);
        
        // return true;
    }


    /// @notice setup directors
    /// @dev only CHAIRMAN_ROLE can call this method
    /// @param _Bod array of address
    function setupBOD(address[] memory _Bod) public onlyRole(CHAIRMAN_ROLE) {
        for(uint i = 0; i < _Bod.length; i < i++){
            grantRole(DIRECTOR_ROLE, _Bod[i]);
        }

        emit SetUpBOD(_Bod);
        
        // return true;
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
        // return true;
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
        // return true;
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
        public 
        allRole 
        electionIsActive
        electionHasEnded
        whenNotPaused 
    {
        if(voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint currentVote = voteCount[_participantsName];
        voteCount[_participantsName] = currentVote + 1;
        voterStatus[msg.sender] = true;

        emit Vote(msg.sender);
        // return true;
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
        public 
        onlyChairmanAndTeacherRole 
        returns(Candidates[] memory)
    {
        require(endAt > startAt, 'Election still ongoing or has not started');
        require(results.length == 0, 'Results already compiled');

        for(uint i = 0; i < contestantsName.length; i++){
            Candidates memory _candidates = candidates[contestantsName[i]];
        
            _candidates.voteCount = voteCount[contestantsName[i]];
        
            results.push(_candidates);
        }

        emit CompileResult(msg.sender);

        return results;
    }


    /// @notice for making result public
    /// @dev allrole except STUDENT_ROLE can call this function
    function showResult() onlyChairmanAndTeacherAndDirectorRole() public {
        require(results.length > 0, "Result has not been compiled");

        resultStatus = true;

        _updateStatusOnFactory(RESULTS_READY);

        resultReadyAt = block.timestamp;

        emit ShowResult(msg.sender, resultReadyAt);

        // return true;
    }

    /// @notice for viewing results
    /// @dev resultStatus must be true to view the result
    function result() public view returns(Candidates[] memory){
        if(resultStatus == false) revert ResultNotYetRelease();
        return results;
    }

    /// @notice for privateViewing results
    /// @dev allRole except STUDENT_ROLE can call this method
    function privateViewResult()  public view onlyChairmanAndTeacherAndDirectorRole returns(Candidates[] memory){
        return results;
    }

    /// @dev Makes call to the election factory to update the status of an election.
    function _updateStatusOnFactory(string memory _status) internal {
        IElectionFactory(electionFactory).updateElectionStatus(index, _status);
    }

}
