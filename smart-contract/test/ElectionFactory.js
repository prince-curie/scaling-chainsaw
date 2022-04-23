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

    describe("ElectionFactory - getElections" ,function(){
        let start, length;

        beforeEach(function(){
            start = 1;
            length = 20;
        })

        it("Should revert when a non-owner calls it", async function(){
             await expect(contract.connect(newOwner).getElections(start, length)).to.be.reverted;
        })

        it("Should revert when caller sets start to 0", async function(){
            const newStart = 0;
            await expect(contract.getElections(newStart, length)).to.be.reverted;
        })

        it("ElectionLength must be equal to length of Elections Array", async function(){
            const arrayLength = await contract.elections.length;
            const getter = await contract.getElections.electionsLength;
            await expect(arrayLength).to.be.equal(getter);
        })
    })

})