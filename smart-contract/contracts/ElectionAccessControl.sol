// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ElectionAccessControl is AccessControl {
    /// @dev Declares and initialises various roles
    bytes32 public constant CHAIRMAN_ROLE = keccak256("CHAIRMAN_ROLE");
    bytes32 public constant DIRECTOR_ROLE = keccak256("DIRECTOR_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    constructor(address _owner) {
        /// @dev Creates the role admins for different roles
        super._setRoleAdmin(STUDENT_ROLE, TEACHER_ROLE);
        super._setRoleAdmin(TEACHER_ROLE, CHAIRMAN_ROLE);
        super._setRoleAdmin(DIRECTOR_ROLE, CHAIRMAN_ROLE);
        super._setRoleAdmin(CHAIRMAN_ROLE, CHAIRMAN_ROLE);

        /// @dev Assigns the Director role to a user
        super._grantRole(DIRECTOR_ROLE, _owner);
        /// @dev Assigns the Chairman role to a user
        super._grantRole(CHAIRMAN_ROLE, _owner);
    }

    /**
     * @dev Revokes `role` from the calling account and adds a new account to the role. 
     * @dev It is only open to the CHAIRMAN_ROLE
     *
     * @dev The new account should be that of a director.
     */
    function renounceRole(bytes32 _role, address _account) public override onlyRole(CHAIRMAN_ROLE) {
        require(_role == CHAIRMAN_ROLE, "Only the chairman role can be renounced.");

        if(!super.hasRole(DIRECTOR_ROLE, _account)) {
            revert("The address for the new chairman is not a director yet");
        }

        super._grantRole(CHAIRMAN_ROLE, _account);

        super._revokeRole(CHAIRMAN_ROLE, msg.sender);
    }

    /**
     * @dev Revokes `role` from `account` except the chairman role.
     */
    function revokeRole(bytes32 _role, address _account) public override onlyRole(getRoleAdmin(_role)) {
        if(super.hasRole(CHAIRMAN_ROLE, _account)) {
            revert('Chairman role cannot be revoked');
        }

       super._revokeRole(_role, _account);
    }
}