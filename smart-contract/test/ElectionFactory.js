const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require('ethereum-waffle');

use(solidity);

describe('Election factory', function() {
    let owner, newOwner, contract;

    beforeEach( async function() {
        [owner, newOwner] = await ethers.getSigners();
        
        const Contract = await ethers.getContractFactory('ElectionFactory');
        contract = await Contract.deploy();
    })

    describe('Election factory - Owner', function() {
        it('Should revert if non-owner tries to change owner', async function() {
            await expect(contract.connect(newOwner).setOwner(newOwner.address)).to.be.reverted;
        })

        it('Should successfully change owner', async function() {
            const formerOwner = await contract.owner();

            await contract.setOwner(newOwner.address);

            const newOwnerAddress = await contract.owner();

            expect(formerOwner).to.not.be.equal(newOwnerAddress);
            expect(newOwnerAddress).to.be.equal(newOwner.address);
        })
    })

    describe('Election factory - Create election', function() {
        let contestants, position;

        beforeEach(function() {
            contestants = [
                "Harry May", "Segun Baba", "Aliu Mohammed", 
                "Chukwu Ama"
            ];

            position = "Head boy"
        })

        it('Should revert if non-owner tries to create an election', async function() {
            await expect(contract.connect(newOwner).createElection(position, contestants)).to.be.reverted;
        })

        it('Should emit the CreateElection event', async function() {
            await expect(contract.createElection(position, contestants))
                .to.emit(contract, 'CreateElection')
        })

        it('Should increment election count when a new election is created', async function() {
            let count = 0;

            await contract.createElection(position, contestants);

            let newCount = await contract.electionCount();

            expect(ethers.BigNumber.from(count)).to.be.not.equal(newCount);
            expect(ethers.BigNumber.from(count)).to.be.lt(newCount);
            expect(newCount).to.be.gt(ethers.BigNumber.from(count));
        })
    })
})

describe('Election factory - Update election', function() {
    let election, electionfactory;
    let chairman, teacher;
    let electionAddress;
    let electionIndex; 
    let position = "head boy";
    const contestant1 = "Godwill";
    const contestant2 = "Prince";
    const contestants = [contestant1, contestant2];

    beforeEach( async function() {
        [chairman, teacher] = await ethers.getSigners()
        
        const ElectionFactory = await ethers.getContractFactory("ElectionFactory")
        electionfactory = await ElectionFactory.deploy();
        await electionfactory.deployed()
        
        await electionfactory.createElection(position, contestants)
        
        const createElectionEvent = await electionfactory.queryFilter('CreateElection');
        
        electionIndex = createElectionEvent[0].args[0].toNumber();
        electionAddress = createElectionEvent[0].args[1];
        
    })

    it('Should fail to update status of an election', async function() {
        await expect(electionfactory.updateElectionStatus(electionIndex, "Started")).to.be.reverted
    })
})

describe("Election factory - get elections", function() {
    let electionfactory, chairman, teacher;
    let position = "head boy";
    const contestant1 = "Godwill";
    const contestant2 = "Prince";
    const contestants = [contestant1, contestant2];
    const noOfElections = 3

    beforeEach( async function() {
        [chairman, teacher] = await ethers.getSigners()
        
        const ElectionFactory = await ethers.getContractFactory("ElectionFactory")
        electionfactory = await ElectionFactory.deploy();
        await electionfactory.deployed()

        for(let i = 0; i < noOfElections; i++) {
            await electionfactory.createElection(position, contestants);
        }
    })

    it("Should revert if the start is placed at zero(0)", async function() {
        await expect(electionfactory.getElections(0, 10)).to.be.reverted;
    })

    it("Should get all elections successfully", async function() {
        const result = await electionfactory.getElections(1, noOfElections);     
        
        expect(result).to.be.an('array');
        expect(result[0].length).to.equal(noOfElections);
    })

    it("Should get only specified number of elections successfully", async function() {
        const result = await electionfactory.getElections(1, noOfElections - 1);     
        
        expect(result).to.be.an('array');
        expect(result[0].length).to.equal(noOfElections - 1);
    })

    it("Should get only available number of elections successfully", async function() {
        const length = 10;

        const result = await electionfactory.getElections(1, length);     
        
        expect(result).to.be.an('array');
        expect(result[0].length).to.equal(noOfElections);
        expect(result[0].length).to.not.equal(length);
    })
})