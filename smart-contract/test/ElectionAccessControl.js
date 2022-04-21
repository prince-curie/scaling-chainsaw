const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require('ethereum-waffle');

use(solidity);

describe('ElectionAccessControl', function() {
    let chairman, director, teacher, student;
    let contract;

    beforeEach(async function() {
        [chairman, director, teacher, student] = await ethers.getSigners()
        
        const Contract = await ethers.getContractFactory('ElectionAccessControl');
        contract = await Contract.deploy(chairman.address)
    })

    // Renounce role method
    it('Should Allow chairman renounce chairman role', async function() {
        let chairmanRole = await contract.CHAIRMAN_ROLE();
        let directorRole = await contract.DIRECTOR_ROLE();

        await contract.grantRole(directorRole, director.address);

        await contract.renounceRole(chairmanRole, director.address);

        let result1 = await contract.hasRole(chairmanRole, chairman.address);
        let result2 = await contract.hasRole(chairmanRole, director.address);
        
        expect(result1).to.equal(false);
        expect(result2).to.equal(true);
    })

    it('Should emit RenounceRole event', async function() {
        let chairmanRole = await contract.CHAIRMAN_ROLE();
        let directorRole = await contract.DIRECTOR_ROLE();

        await contract.grantRole(directorRole, director.address);

        await expect(contract.renounceRole(chairmanRole, director.address))
            .to.emit(contract, 'RenounceRole')
            .withArgs(chairman.address, director.address);
    })

    it('Should revert if a none chairman role tries to renounce', async function() {
        let directorRole = await contract.DIRECTOR_ROLE();
        
        await expect(contract.connect(director).renounceRole(directorRole, student.address)).to.be.reverted;
    })

    it('Should revert if a none director tries to access the chairman role', async function() {
        let chairmanRole = await contract.CHAIRMAN_ROLE();
        
        await expect(contract.renounceRole(chairmanRole, student.address)).to.be.reverted;
    })

    it('Should revert if a none chairman role is passed as params', async function() {
        let directorRole = await contract.DIRECTOR_ROLE();
        
        await expect(contract.renounceRole(directorRole, student.address)).to.be.reverted;
    })

    // Revert role
    it('Should revert if not called by chairman', async function() {
        let directorRole = await contract.DIRECTOR_ROLE();

        await expect(contract.connect(director).revokeRole(directorRole, director.address)).to.be.reverted;
    })

    it('Should fail if a chairman tries to revoke his role', async function() {
        let teacherRole = await contract.TEACHER_ROLE();

        await expect(contract.revokeRole(teacherRole, chairman.address)).to.be.revertedWith('Chairman role cannot be revoked');
    })

    it('Should revoke role successfully', async function() {
        let studentRole = await contract.STUDENT_ROLE();
        let teacherRole = await contract.TEACHER_ROLE();

        await contract.grantRole(teacherRole, teacher.address);

        await contract.connect(teacher).grantRole(studentRole, student.address);

        const hadStudentRole = await contract.hasRole(studentRole, student.address);

        await contract.connect(teacher).revokeRole(studentRole, student.address);

        const isStudentRole = await contract.hasRole(studentRole, student.address);
        
        expect(hadStudentRole).to.equal(true);
        expect(isStudentRole).to.equal(false);
    })
})