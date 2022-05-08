const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require('ethereum-waffle');

const { BigNumber, getSigners, getContractFactory, getContractAt } = ethers;

use(solidity);

let Election, election;
let chairman, teacher, director, student, student2, student3, teacher1, notAStakeholder, director1
let electionAddress;
let electionIndex; 
let position = "head boy";
const contestant1 = "Godwill";
const contestant2 = "Prince";
const contestants = [contestant1, contestant2];

describe("Election", function () {
  beforeEach( async function() {
    [chairman, teacher, director,student, student2, student3, notAStakeholder, teacher1, director1] = await getSigners()
    
    const ElectionFactory = await getContractFactory("ElectionFactory")
    const electionfactory = await ElectionFactory.deploy();
    await electionfactory.deployed()
    
    await electionfactory.createElection(position, contestants)
    
    const createElectionEvent = await electionfactory.queryFilter('CreateElection');
    
    electionIndex = createElectionEvent[0].args[0].toNumber();
    electionAddress = createElectionEvent[0].args[1];
    
    election = await getContractAt("Election", electionAddress, chairman);
  })

  //Deployment
  it("Deployment should fail if number of participants is not correct", async function() {
    Election = await getContractFactory("Election")

    await expect(Election.deploy(chairman.address, position, contestants.length + 1, contestants, 9, notAStakeholder.address)).to.be.reverted;
  })

  // Register teacher
  it('Chairman should be able to register teachers', async function() {
    let teacherRole = await election.TEACHER_ROLE();
    
    let hasTeacherRoleInitially0 = await election.hasRole(teacherRole, teacher.address)
    let hasTeacherRoleInitially1 = await election.hasRole(teacherRole, teacher1.address)

    await election.setupTeachers([teacher.address, teacher1.address]);

    let hasTeacherRole0 = await election.hasRole(teacherRole, teacher.address)
    let hasTeacherRole1 = await election.hasRole(teacherRole, teacher1.address)

    expect(hasTeacherRoleInitially0).to.be.false;
    expect(hasTeacherRoleInitially1).to.be.false;
    expect(hasTeacherRole0).to.be.true;
    expect(hasTeacherRole1).to.be.true;
  })

  it('Should revert if a non chairman tries to register a teacher', async function() {
    await election.setupBOD([director.address]);
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student.address])

    await expect(election.connect(notAStakeholder).setupTeachers([teacher1.address])).to.be.reverted;
    await expect(election.connect(director).setupTeachers([teacher1.address])).to.be.reverted;
    await expect(election.connect(teacher).setupTeachers([teacher1.address])).to.be.reverted;
    await expect(election.connect(student).setupTeachers([teacher1.address])).to.be.reverted;
  })

  it('Should emit SetUpTeacher event', async function() {
    await expect(election.setupTeachers([teacher.address, teacher1.address])).to.emit(election, 'SetUpTeacher');
  })

  // Register students
  it('Teacher should be able to register students', async function() {
    let studentRole = await election.STUDENT_ROLE();
    
    let hasStudentRoleInitially0 = await election.hasRole(studentRole, student.address)
    let hasStudentRoleInitially1 = await election.hasRole(studentRole, student2.address)
    let hasStudentRoleInitially2 = await election.hasRole(studentRole, student3.address)

    await election.setupTeachers([teacher.address])

    await election.connect(teacher).registerStudent([student.address, student2.address, student3.address]);

    let hasStudentRole0 = await election.hasRole(studentRole, student.address)
    let hasStudentRole1 = await election.hasRole(studentRole, student2.address)
    let hasStudentRole2 = await election.hasRole(studentRole, student3.address)

    expect(hasStudentRoleInitially0).to.be.false;
    expect(hasStudentRoleInitially1).to.be.false;
    expect(hasStudentRoleInitially2).to.be.false;
    expect(hasStudentRole0).to.be.true;
    expect(hasStudentRole1).to.be.true;
    expect(hasStudentRole2).to.be.true;
  })

  it('Should revert if a non teacher tries to register a student', async function() {
    await election.setupBOD([director.address]);
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student2.address])

    await expect(election.connect(notAStakeholder).registerStudent([student.address])).to.be.reverted;
    await expect(election.connect(director).registerStudent([student.address])).to.be.reverted;
    await expect(election.connect(chairman).registerStudent([student.address])).to.be.reverted;
    await expect(election.connect(student2).registerStudent([student.address])).to.be.reverted;
  })

  it('Should emit SetUpTeacher event', async function() {
    await election.setupTeachers([teacher.address]);

    await expect(election.connect(teacher).registerStudent([student.address, student2.address, student3.address])).to.emit(election, 'RegisterStudent');
  })

  // Register board of directors
  it('Chairman should be able to register directors', async function() {
    let directorRole = await election.DIRECTOR_ROLE();
    
    let hasDirectorRoleInitially0 = await election.hasRole(directorRole, director.address)
    let hasDirectorRoleInitially1 = await election.hasRole(directorRole, director1.address)

    await election.setupBOD([director.address, director1.address]);

    let hasDirectorRole0 = await election.hasRole(directorRole, director.address)
    let hasDirectorRole1 = await election.hasRole(directorRole, director1.address)

    expect(hasDirectorRoleInitially0).to.be.false;
    expect(hasDirectorRoleInitially1).to.be.false;
    expect(hasDirectorRole0).to.be.true;
    expect(hasDirectorRole1).to.be.true;
  })

  it('Should revert if a non chairman tries to register a director', async function() {
    await election.setupBOD([director.address]);
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student.address])

    await expect(election.connect(notAStakeholder).setupTeachers([director1.address])).to.be.reverted;
    await expect(election.connect(director).setupTeachers([director1.address])).to.be.reverted;
    await expect(election.connect(teacher).setupTeachers([director1.address])).to.be.reverted;
    await expect(election.connect(student).setupTeachers([director1.address])).to.be.reverted;
  })

  it('Should emit SetUpBOD event', async function() {
    await expect(election.setupBOD([director.address, director1.address])).to.emit(election, 'SetUpBOD');
  })

  // Pause the smart contract
  it("Chairman can pause the smart contract", async function() {
    await election.pause();

    expect(await election.paused()).to.be.true;
  })

  it("non chairman cannot pause the smart contract", async function() {
    await election.setupBOD([director.address]);
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student.address])

    await expect(election.connect(director).pause()).to.be.reverted;
    await expect(election.connect(teacher).pause()).to.be.reverted;
    await expect(election.connect(student).pause()).to.be.reverted;
    await expect(election.connect(notAStakeholder).pause()).to.be.reverted;
  })

  // Unpause the smart contract
  it("Chairman can unpause a paused smart contract", async function() {
    await election.pause();

    const afterPause = await election.paused();

    await election.unpause()
    
    expect(await election.paused()).to.be.false;
    expect(afterPause).to.be.true;
  })

  it("non chairman cannot pause the smart contract", async function() {
    await election.setupBOD([director.address]);
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student.address])

    await expect(election.connect(director).unpause()).to.be.reverted;
    await expect(election.connect(teacher).unpause()).to.be.reverted;
    await expect(election.connect(student).unpause()).to.be.reverted;
    await expect(election.connect(notAStakeholder).unpause()).to.be.reverted;
  })

  // Enable voting
  it("Chairman should be able to start the election", async function() {
    let startAt = await election.startAt()

    await election.enableVoting();
    const startVotingEvent = await election.queryFilter('StartVoting');

    let startedAt = await election.startAt()

    expect(startAt.toNumber()).to.be.equal(0)
    expect(startVotingEvent[0].args[0]).to.be.equal(startedAt)
  })

  it("Enable voting function should emit StartVoting event", async function() {
    await expect(election.enableVoting()).to.emit(election, 'StartVoting');
  })

  it("Should revert if non chairman tries to enable voting", async function() {
    await election.setupBOD([director.address]);
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student.address])

    await expect(election.connect(teacher).enableVoting()).to.be.reverted;
    await expect(election.connect(director).enableVoting()).to.be.reverted;
    await expect(election.connect(student).enableVoting()).to.be.reverted;
    await expect(election.connect(notAStakeholder).enableVoting()).to.be.reverted;
  })

  // Voting
  it("All stakeholders should be able to vote", async function () {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address])

    let formerStudentVoterStatus = await election.voterStatus(student.address)
    let formerDirectorVoterStatus = await election.voterStatus(director.address)
    let formerTeacherVoterStatus = await election.voterStatus(teacher.address)
    let formerChairmanVoterStatus = await election.voterStatus(chairman.address)
    
    await election.enableVoting();

    await election.connect(student).vote(contestant1)
    await election.connect(teacher).vote(contestant1)
    await election.connect(director).vote(contestant1)
    await election.vote(contestant2)
    
    let studentVoterStatus = await election.voterStatus(student.address)
    let directorVoterStatus = await election.voterStatus(director.address)
    let teacherVoterStatus = await election.voterStatus(teacher.address)
    let chairmanVoterStatus = await election.voterStatus(chairman.address)

    expect(formerChairmanVoterStatus).to.be.false
    expect(formerDirectorVoterStatus).to.be.false
    expect(formerTeacherVoterStatus).to.be.false
    expect(formerStudentVoterStatus).to.be.false
    expect(chairmanVoterStatus).to.be.true
    expect(directorVoterStatus).to.be.true
    expect(teacherVoterStatus).to.be.true
    expect(studentVoterStatus).to.be.true
  })

  it("Should be not be able vote if not a stakeholder", async function() {
    await (expect(election.connect(notAStakeholder).vote(contestant1))).to.be.reverted
  })

  it("Stakeholders should not be able to vote twice", async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address])

    await election.enableVoting();

    // Voted once
    await election.connect(student).vote(contestant1)
    await election.connect(teacher).vote(contestant1)
    await election.connect(director).vote(contestant1)
    await election.vote(contestant2)

    // Second voting
    await expect(election.connect(student).vote(contestant1)).to.be.reverted
    await expect(election.connect(teacher).vote(contestant1)).to.be.reverted
    await expect(election.connect(director).vote(contestant2)).to.be.reverted
    await expect(election.vote(contestant2)).to.be.reverted
  })

  it("Voting should revert if the election has not started", async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address])

    await expect(election.connect(student).vote(contestant1)).to.be.reverted
    await expect(election.connect(teacher).vote(contestant1)).to.be.reverted
    await expect(election.connect(director).vote(contestant2)).to.be.reverted
    await expect(election.vote(contestant2)).to.be.reverted;
  })

  it('Voting should revert if election is paused', async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address])

    await election.enableVoting();
    await election.pause();

    await expect(election.connect(student).vote(contestant1)).to.be.reverted
    await expect(election.connect(teacher).vote(contestant1)).to.be.reverted
    await expect(election.connect(director).vote(contestant2)).to.be.reverted
    await expect(election.vote(contestant2)).to.be.reverted
  })

  it('Voting should revert if election has ended', async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address])

    await election.enableVoting();
    await election.disableVoting();

    await expect(election.connect(student).vote(contestant1)).to.be.reverted
    await expect(election.connect(teacher).vote(contestant1)).to.be.reverted
    await expect(election.connect(director).vote(contestant2)).to.be.reverted
    await expect(election.vote(contestant2)).to.be.reverted
  })

  it('Voting should emit a vote event', async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address]);

    await election.enableVoting();
    
    await expect(election.connect(student).vote(contestant1)).to.emit(election, 'Vote').withArgs(student.address)
    await expect(election.connect(teacher).vote(contestant1)).to.emit(election, 'Vote').withArgs(teacher.address)
    await expect(election.connect(director).vote(contestant2)).to.emit(election, 'Vote').withArgs(director.address)
    await expect(election.vote(contestant2)).to.emit(election, 'Vote').withArgs(chairman.address)
  })

  // Disable voting
  it('Voting should be disabled', async function() {
    let endAt = await election.endAt()

    await election.enableVoting();
    await election.disableVoting();
    
    const endVotingEvent = await election.queryFilter('EndVoting');

    let endedAt = await election.endAt()

    expect(endAt.toNumber()).to.be.equal(0)
    expect(endVotingEvent[0].args[0]).to.be.equal(endedAt)    
  })

  it("Disable voting should be reverted if non chairman tries to disable voting", async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address]);

    await expect(election.connect(teacher).disableVoting()).to.be.reverted
    await expect(election.connect(director).disableVoting()).to.be.reverted
    await expect(election.connect(student).disableVoting()).to.be.reverted
    await expect(election.connect(notAStakeholder).disableVoting()).to.be.reverted
  })

  it("Disable voting should revert if voting has not started", async function() {
    await expect(election.disableVoting()).to.be.reverted;
  })

  it("Disable voting should emit EndVoting event", async function() {
    await election.enableVoting();

    await expect(election.disableVoting()).to.emit(election, 'EndVoting');
  })

  // Compile result
  it('Chairman should compile results successfully', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    const initialResult = await election.privateViewResult()

    await election.compileResult();

    const result = await election.privateViewResult()

    expect(initialResult.length).to.be.equal(0);
    expect(result.length).to.be.greaterThan(initialResult.length);
    expect(result.length).to.be.equal(contestants.length)
  })

  it("Should be able to compile result if a teacher", async function() {
    await election.setupTeachers([teacher.address]);
    
    await election.enableVoting();
    await election.vote(contestant1);
    await election.disableVoting();

    const initialResult = await election.connect(teacher).privateViewResult()
    await election.connect(teacher).compileResult()
    const result = await election.connect(teacher).privateViewResult();
    
    expect(initialResult.length).to.be.equal(0);
    expect(result.length).to.be.greaterThan(initialResult.length);
    expect(result.length).to.be.equal(contestants.length)
  })

  it('Should emit CompileRessult event', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await expect(election.compileResult()).to.emit(election, 'CompileResult');
  })

  it('Should revert if non accepted stakeholders try to compile result', async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    await election.connect(teacher).registerStudent([student.address]);

    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();

    await expect(election.connect(director).compileResult()).to.be.reverted;
    await expect(election.connect(student).compileResult()).to.be.reverted;
    await expect(election.connect(notAStakeholder).compileResult()).to.be.reverted;    
  })

  it('Should revert if election has not started', async function() {
    await expect(election.compileResult()).to.be.reverted;
  })

  it('Should revert if election is ongoing', async function() {
    await election.enableVoting();

    await expect(election.compileResult()).to.be.reverted;
  })

  it('Should revert if result had initially been compiled', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    await expect(election.compileResult()).to.be.reverted;
  })

  // Show result
  it('Chairman should update the status to show result successfully', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    const initialResultReadyAt = await election.resultReadyAt();
    
    await election.showResult();
    const showResultEvent = await election.queryFilter('ShowResult');
    const resultReadyAt = await election.resultReadyAt();
    
    expect(initialResultReadyAt).to.equal(BigNumber.from(0));
    expect(initialResultReadyAt.toNumber()).to.be.lessThan(resultReadyAt.toNumber());
    expect(showResultEvent[0].args[1]).to.equal(resultReadyAt);
    expect(showResultEvent[0].args[0]).to.equal(chairman.address);
  })

  it('Teacher should update the status to show result successfully', async function() {
    await election.setupTeachers([teacher.address]);
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    const initialResultReadyAt = await election.resultReadyAt();
    
    await election.connect(teacher).showResult();
    const showResultEvent = await election.queryFilter('ShowResult');
    const resultReadyAt = await election.resultReadyAt();
    
    expect(initialResultReadyAt).to.equal(BigNumber.from(0));
    expect(initialResultReadyAt.toNumber()).to.be.lessThan(resultReadyAt.toNumber());
    expect(showResultEvent[0].args[1]).to.equal(resultReadyAt);
    expect(showResultEvent[0].args[0]).to.equal(teacher.address);
  })

  it('Director should update the status to show result successfully', async function() {
    await election.setupBOD([director.address]);
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    const initialResultReadyAt = await election.resultReadyAt();
    
    await election.connect(director).showResult();
    const showResultEvent = await election.queryFilter('ShowResult');
    const resultReadyAt = await election.resultReadyAt();
    
    expect(initialResultReadyAt).to.equal(BigNumber.from(0));
    expect(initialResultReadyAt.toNumber()).to.be.lessThan(resultReadyAt.toNumber());
    expect(showResultEvent[0].args[1]).to.equal(resultReadyAt);
    expect(showResultEvent[0].args[0]).to.equal(director.address);
  })

  it('Non allowed stakeholders should not update the status to show result successfully', async function() {
    await election.setupTeachers([teacher.address]);
    await election.connect(teacher).registerStudent([student.address]);

    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    await expect(election.connect(student).showResult()).to.be.reverted;
    await expect(election.connect(notAStakeholder).showResult()).to.be.reverted;
  })

  it('Show result should revert if result has not been compiled', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await expect(election.showResult()).to.be.reverted;
  })

  // Result
  it('Should successfully return result', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    await election.showResult()

    const result = await election.result();

    expect(result.length).to.equal(contestants.length);
    expect(result.length).to.greaterThan(0);
  })

  it('Should revert if result has not been compiled', async function() {
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();

    await expect(election.result()).to.be.reverted;
  })

  // Private result
  it('Non students stakeholders should successfully view result', async function() {
    await election.setupTeachers([teacher.address]);
    await election.setupBOD([director.address]);
    
    await election.enableVoting();

    await election.vote(contestant2);

    await election.disableVoting();
    
    await election.compileResult();

    await election.connect(chairman).privateViewResult();
    await election.connect(teacher).privateViewResult();
    await election.privateViewResult();
  })
});
