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

  it("should allow migration master to be changed only by migration master", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    yield utils.assertThrows(trst.changeMigrationMaster(OWNER, {from: OWNER}))
    assert.equal(yield trst.migrationMaster.call(), MIGRATION_MASTER)

    // Here comes the migration master - let her in
    yield trst.changeMigrationMaster(OWNER, {from: MIGRATION_MASTER})
    assert.equal(yield trst.migrationMaster.call(), OWNER)
  }))

  it("should allow migration period to be started only by migration master", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    yield utils.assertThrows(trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: OWNER}));
    assert.isNotOk(yield trst.allowOutgoingMigrations.call())

    // Here comes the migration master - she's welcome.
    yield trst.beginMigrationPeriod(consts.NON_ZERO_ADDRESS, {from: MIGRATION_MASTER})
    assert.isOk(yield trst.allowOutgoingMigrations.call())
  }))

  it("should allow migration finalization only by migration master", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)

    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    utils.increaseTime(
      (yield trst.minimumMigrationDuration.call()) + consts.ONE_WEEK_IN_SECONDS)

    utils.mineOneBlock()
    yield utils.assertThrows(trst.finalizeOutgoingMigration({from: OWNER, gas:2.4e6}))
    assert.isOk(yield trst.allowOutgoingMigrations.call())

    // Here comes the migration master - she can finalize at her will.
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: MIGRATION_MASTER, gas: 2.4e6})
    assert.isNotOk(yield trst.allowOutgoingMigrations.call())
  }))
})
