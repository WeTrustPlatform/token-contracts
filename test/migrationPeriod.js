'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Migration Period", function(accounts_) {
  let MINIMUM_MIGRATION_DURATION
  let OWNER = accounts_[0]
  let MIGRATION_MASTER = accounts_[1]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    MINIMUM_MIGRATION_DURATION = yield trst.minimumMigrationDuration.call()
  }))

  it("should not allow migration finalization until after mimumum migration period", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    utils.increaseTime(MINIMUM_MIGRATION_DURATION.toNumber() - consts.ONE_WEEK_IN_SECONDS)
    utils.mineOneBlock()
    yield utils.assertThrows(trst.finalizeOutgoingMigration({from: MIGRATION_MASTER}))

    utils.increaseTime(consts.ONE_WEEK_IN_SECONDS * 2)
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: MIGRATION_MASTER})
  }))

  it("should not allow restarting migration during migration period", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    let trst3 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    yield utils.assertThrows(trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER}))
    yield utils.assertThrows(trst.beginMigrationPeriod(trst3.address, {from: MIGRATION_MASTER}))
    utils.increaseTime(MINIMUM_MIGRATION_DURATION.toNumber() + consts.ONE_WEEK_IN_SECONDS)
    utils.mineOneBlock()
    yield utils.assertThrows(trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER}))
    yield utils.assertThrows(trst.beginMigrationPeriod(trst3.address, {from: MIGRATION_MASTER}))
  }))
})
