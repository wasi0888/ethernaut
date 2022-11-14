const Statistics = artifacts.require('./metrics/Statistics.sol');
const chai = require('chai');
const { expect } = chai;
const { solidity } = require('ethereum-waffle');

chai.use(solidity);

contract('Level metrics', (accounts) => {
    let statistics;

    let [
        ETHERNAUT_ADDRESS,
        PLAYER_ADDRESS_1,
        PLAYER_ADDRESS_2,
        LEVEL_FACTORY_ADDRESS_1,
        LEVEL_FACTORY_ADDRESS_2,
        LEVEL_INSTANCE_ADDRESS_1,
        LEVEL_INSTANCE_ADDRESS_2,
        LEVEL_INSTANCE_ADDRESS_3
    ] = accounts;
    
    before(async () => { 
        statistics = await Statistics.new();
        await statistics.initialize(ETHERNAUT_ADDRESS);
    })

    describe('Level metrics', function () {
        describe('Addition of multiple levels', () => {
            it('adds multiple levels', async () => {
                await statistics.saveNewLevel(LEVEL_FACTORY_ADDRESS_1);
                await statistics.saveNewLevel(LEVEL_FACTORY_ADDRESS_2);
            });
        });

        describe("Creation of multiple level instances", () => {
            before(async () => { 
                await statistics.createNewInstance(LEVEL_INSTANCE_ADDRESS_1, LEVEL_FACTORY_ADDRESS_1, PLAYER_ADDRESS_1);
                await statistics.createNewInstance(LEVEL_INSTANCE_ADDRESS_2, LEVEL_FACTORY_ADDRESS_2, PLAYER_ADDRESS_1);
                await statistics.createNewInstance(LEVEL_INSTANCE_ADDRESS_3, LEVEL_FACTORY_ADDRESS_1, PLAYER_ADDRESS_2);
            })

            it('checks no of level instances created', async () => {
                expect((await statistics.getTotalNoOfLevelsCreated()).toNumber()).to.equal(3)
            })

            it('checks total no of players', async () => { 
                expect((await statistics.getTotalNoOfPlayers()).toNumber()).to.equal(2)
            })
        })

        describe("Getting global level stats", () => {
            before(async () => { 
                await statistics.submitSuccess(LEVEL_INSTANCE_ADDRESS_1, LEVEL_FACTORY_ADDRESS_1, PLAYER_ADDRESS_1);
                await statistics.submitFailure(LEVEL_INSTANCE_ADDRESS_2, LEVEL_FACTORY_ADDRESS_2, PLAYER_ADDRESS_1);
                await statistics.submitSuccess(LEVEL_INSTANCE_ADDRESS_3, LEVEL_FACTORY_ADDRESS_1, PLAYER_ADDRESS_2);
            })

            it('checks no of completed submissions', async () => {
                expect((await statistics.getTotalNoOfLevelsCompleted()).toNumber()).to.equal(2)
            })

            it('checks no of failed submissions', async () => { 
                expect((await statistics.getTotalNoOfLevelsFailures()).toNumber()).to.equal(1)
            })
        })

        describe("Getting the level specific stats", () => { 
            it('checks the no of instances created for a level', async () => {
                expect((await statistics.getNoOfInstancesForLevel(LEVEL_FACTORY_ADDRESS_1)).toNumber()).to.equal(2)
                expect((await statistics.getNoOfInstancesForLevel(LEVEL_FACTORY_ADDRESS_2)).toNumber()).to.equal(1)
            })

            it('checks the no of completed instances of a level', async () => {
                expect((await statistics.getNoOfCompletedSubmissionForLevel(LEVEL_FACTORY_ADDRESS_1)).toNumber()).to.equal(2)
            })

            it('checks the no of failed instances of a level', async () => {
                expect((await statistics.getNoOfFailedSubmissionForLevel(LEVEL_FACTORY_ADDRESS_2)).toNumber()).to.equal(1)
            })
        })
    });
});

