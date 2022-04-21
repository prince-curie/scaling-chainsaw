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