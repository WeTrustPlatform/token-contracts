'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Authentication", function(accounts_) {

  let MINIMUM_MIGRATION_DURATION
  let OWNER = accounts_[0]
  let MIGRATION_MASTER = accounts_[1]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    MINIMUM_MIGRATION_DURATION = yield trst.minimumMigrationDuration.call()
  }))
  
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
    assert.isNotOk(allowMigrations)
  }))

  it("should allow migration period to be started by migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: migrationMaster})
    let allowMigrations = yield trst.allowOutgoingMigrations.call()
    assert.isOk(allowMigrations)
  }))

  it("should not allow migration finalization by anyone other than migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    yield trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: migrationMaster})
    utils.increaseTime(consts.ONE_YEAR_IN_SECONDS)
    utils.mineOneBlock()
    yield utils.assertThrows(trst.finalizeOutgoingMigration({from: owner}))
    let allowMigrations = yield trst.allowOutgoingMigrations.call()
    assert.isOk(allowMigrations)
  }))

  it("should allow migration finalization by migration master", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    utils.increaseTime(MINIMUM_MIGRATION_DURATION.toNumber() + consts.ONE_WEEK_IN_SECONDS)
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: migrationMaster, gas: 2400000})
    let allowMigrations = yield trst.allowOutgoingMigrations.call()
    assert.isNotOk(allowMigrations)
  }))

})