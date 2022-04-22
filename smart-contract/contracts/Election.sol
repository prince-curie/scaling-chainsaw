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

    struct Candidates {
        string candidatesName;
        uint256 voteCount;
    }

    mapping(address => bool) voterStatus;
    mapping(string => Candidates) candidates;
    mapping(string => uint256) voteCount;
    Candidates[] results;

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

    function setupTeachers(address[] memory _teacher)
        public
        onlyRole(CHAIRMAN_ROLE)
        returns (bool)
    {
        for (uint256 i = 0; i < _teacher.length; i++) {
            _grantRole(TEACHER_ROLE, _teacher[i]);
        }
        return true;
    }

    function registerStudent(address[] memory _student)
        public
        onlyRole(CHAIRMAN_ROLE)
        onlyRole(TEACHER_ROLE)
        returns (bool)
    {
        for (uint256 i = 0; i < _student.length; i++) {
            _grantRole(STUDENT_ROLE, _student[i]);
        }
        return true;
    }

    function setupBOD(address[] memory _Bod)
        public
        onlyRole(CHAIRMAN_ROLE)
        returns (bool)
    {
        for (uint256 i = 0; i < _Bod.length; i < i++) {
            _grantRole(DIRECTOR_ROLE, _Bod[i]);
        }
        return true;
    }

    function vote(string memory _participantsName)
        public
        onlyRole(STUDENT_ROLE)
        onlyRole(TEACHER_ROLE)
        onlyRole(CHAIRMAN_ROLE)
        onlyRole(DIRECTOR_ROLE)
        whenNotPaused
        returns (bool)
    {
        if (voterStatus[msg.sender] == true) revert AlreadyVoted();
        uint256 currentVote = voteCount[_participantsName];
        voteCount[_participantsName] = currentVote + 1;
        voterStatus[msg.sender] = true;
        return true;
    }

    function compileResult()
        public
        onlyRole(TEACHER_ROLE)
        onlyRole(CHAIRMAN_ROLE)
        returns (Candidates[] memory)
    {
        for (uint256 i = 0; i < contestantsName.length; i++) {
            Candidates storage _candidates = candidates[contestantsName[i]];
            _candidates.voteCount = voteCount[contestantsName[i]];
            results.push(_candidates);
        }
        return results;
    }

    function showResult() public onlyRole(CHAIRMAN_ROLE) returns (bool) {
        resultStatus = true;

        _upStatusOnFactory(RESULTS_READY);

        return true;
    }

    function result() public view returns (Candidates[] memory) {
        if (resultStatus == false) revert ResultNotYetRelease();
        return results;
    }

    function privateViewResult()
        public
        view
        onlyRole(TEACHER_ROLE)
        onlyRole(CHAIRMAN_ROLE)
        returns (Candidates[] memory)
    {
        return results;
    }

    /// @dev Makes call to the election factory to update the status of an election.
    function _upStatusOnFactory(string _status) internal {
        IElectionFactory(electionFactory).upStateElectionStatus(index, _status);
    }

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

    ///======================= EVENTS ==============================
    ///@notice event to emit when election has ended
    event ElectionEnded(uint256[] _winnerIds, uint256 _winnerVoteCount);
}
