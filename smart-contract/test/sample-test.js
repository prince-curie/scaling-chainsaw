const { expect } = require("chai");
const { ethers } = require("hardhat");
let Election,election;

describe("Election", function () {
  it("Should Deploy Election", async function () {
    Election = await ethers.getContractFactory("Election");
    election = await Election.deploy("Head Boy", 2, ["0xc9e9DB9dcF8fAF12D4357868222B05E369EadB9b", "0xF775103c8BCB600218B9354F2dE76a7cd96cefc5"]);
    await election.deployed();
  });

  describe("vote()", function () {
    it("Should be able to vote if a stakeholder", async function () {
      const vote = await election.vote("0xc9e9DB9dcF8fAF12D4357868222B05E369EadB9b")
      const result = await election.compileResult()
      const results = await election.result();
      console.log(results) 
     //expect( await election.vote("0xc9e9DB9dcF8fAF12D4357868222B05E369EadB9b")).to.equal(true);
    })
  });
});
