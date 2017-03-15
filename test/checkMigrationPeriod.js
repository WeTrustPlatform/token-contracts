'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Migration Period", function(accounts_) {
  it("should not allow migration finalization before six months after beginning the migration", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    yield utils.assertThrows(trst.finalizeOutgoingMigration({from: migrationMaster}))
  }))
  it("should allow migration finalization six months after beginning the migration", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    utils.increaseTime(consts.ONE_YEAR_IN_SECONDS)
    yield utils.assertDoesNotThrow(trst.finalizeOutgoingMigration({from: migrationMaster}))
  }))
})