'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Authentication", function(accounts_) {
  it("should not allow migration master to be changed by anyone other than migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield utils.assertThrows(trst.changeMigrationMaster(owner, {from: owner}))
    let contractMigrationMaster = yield trst.migrationMaster.call()
    assert.equal(contractMigrationMaster, migrationMaster)
  }))
  it("should allow migration master to be changed by migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield trst.changeMigrationMaster(owner, {from: migrationMaster})
    let contractMigrationMaster = yield trst.migrationMaster.call()
    assert.equal(contractMigrationMaster, owner)
  }))
  it("should not allow migration period to be started by anyone other than migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield utils.assertThrows(trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: owner}));
    let allowMigrations = yield trst.allowOutgoingMigrations.call()
    assert.equal(allowMigrations, false)
  }))
  it("should allow migration period to be started by migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: migrationMaster})
    let allowMigrations = yield trst.allowOutgoingMigrations.call()
    assert.equal(allowMigrations, true)
  }))
  it("should not allow migration finalization by anyone other than migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: migrationMaster})
    utils.increaseTime(consts.ONE_YEAR_IN_SECONDS)
    yield utils.assertThrows(trst.finalizeOutgoingMigration({from: owner}))
    let allowMigrations = yield trst.allowOutgoingMigrations.call()
    assert.equal(allowMigrations, true)
  }))
  it("should allow migration finalization by migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    utils.increaseTime(consts.ONE_YEAR_IN_SECONDS)
    utils.mineOneBlock()
    
    let allowOutgoingMigrationsUntilAtLeast = yield trst.allowOutgoingMigrationsUntilAtLeast.call()
    console.log(allowOutgoingMigrationsUntilAtLeast.toNumber())

    let blockTime = yield trst.blockTime.call()
    console.log(blockTime.toNumber())

    yield trst.finalizeOutgoingMigration({from: migrationMaster, gas: 2400000})
    let allowMigrations = yield trst.allowOutgoingMigrations.call()

    assert.equal(allowMigrations, false)
  }))
})