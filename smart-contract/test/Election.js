const { expect } = require("chai");
const { ethers } = require("hardhat");
let Election,election;
let chairman, teacher, director, student, student2, student3



describe("Election", function () {
  it("Should Deploy Election", async function () {
   [chairman, teacher, director,student, student2, student3, notAStakeholder] = await ethers.getSigners()
    Election = await ethers.getContractFactory("Election");
    election = await Election.deploy(chairman.address, "Head Boy", 2, ["GoodWill", "Prince"]);
    await election.deployed();
    console.log(teacher.address, chairman.address, student.address)
    await election.connect(chairman).setupTeachers([teacher.address])
    await election.connect(teacher).registerStudent([student.address, student2.address, student3.address])
    await election.connect(chairman).setupBOD([director.address])
    let studentRole = await election.STUDENT_ROLE()
    const isStudentRole = await election.hasRole(studentRole, student.address);
    console.log(isStudentRole)
  });

  describe("vote()", function () {
    it("Should be able to vote if a student", async function () {
      const vote = await election.connect(student).vote("GoodWill")
      const result = await election.connect(teacher).compileResult()
      const results = await election.connect(teacher).privateViewResult();
      expect(results[0].voteCount.toString()).to.equal('1')
    })

    it("Should be able to vote if a teacher", async function() {
      const vote = await election.connect(teacher).vote("GoodWill")
      const result = await election.connect(teacher).compileResult()
      const results = await election.connect(teacher).privateViewResult();
      expect(results[0].voteCount.toString()).to.equal('1')
    })

    it("Should be able to vote if a director", async function() {
      const vote = await election.connect(director).vote("GoodWill")
      const result = await election.connect(teacher).compileResult()
      const results = await election.connect(teacher).privateViewResult();
      expect(results[0].voteCount.toString()).to.equal('1')
    })

    it("Should be able to vote if a chairman", async function() {
      await election.connect(chairman).vote("GoodWill")
      await election.connect(teacher).compileResult()
      const results =  await election.connect(teacher).privateViewResult();
      expect(results[0].voteCount.toString()).to.equal('1')
    })

    it("Should be not be able vote if not a stakeholder", async function() {
      await (expect(election.connect(notAStakeholder).vote("GoodWill"))).to.be.revertedWith("ACCESS DENIED")
    })

    it("Should not be able to vote twice", async function() {
      await expect(election.connect(student).vote("prince")).to.be.reverted
    })
  });

  describe("Compile result", function () {
    it("Should be able to compile result if a teacher", async function() {
      await election.connect(student2).vote("GoodWill")
      await election.connect(teacher).compileResult()
      const results = await election.connect(teacher).privateViewResult();
      expect(results[0].voteCount.toString()).to.equal('1')
    })

    it("Should be able to compile result if a chairman", async function() {
      await election.connect(student3).vote("GoodWill")
      await election.connect(chairman).compileResult()
      const results = await election.connect(teacher).privateViewResult();
      expect(results[0].voteCount.toString()).to.equal('1')
    })
  })

  describe("View Result", function () {
    it("Student Cannot view result until made public allowed by a stakeholder", async function() {;
      await expect(election.connect(student).result()).to.be.reverted
    })

    it("other stakeholder can see result", async function() {
      const results = await election.connect(teacher).privateViewResult()
      expect(results[0].voteCount.toString()).to.equal('1')
    })
  })

  describe("Security", function () {
    it("Chairman can pause voting method in case of emergency", async function() {
      await election.connect(chairman).pause()
      await expect(election.connect(student).vote("prince")).to.be.revertedWith("Pausable: paused")
    })
  })

});
