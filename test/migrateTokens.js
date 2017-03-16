'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Migration Features", function(accounts_) {

  let MINIMUM_MIGRATION_DURATION
  let OWNER = accounts_[0]
  let MIGRATION_MASTER = accounts_[1]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    MINIMUM_MIGRATION_DURATION = yield trst.minimumMigrationDuration.call()
  }))

  it("should not allow migrating tokens before migration has started", co(function* () {
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: MIGRATION_MASTER}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))

  it("should not allow migrating 0 tokens", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    yield utils.assertThrows(trst.migrateToNewContract(0, {from: OWNER}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))

  it("should not allow migrating more tokens than we own", co(function* () {
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: MIGRATION_MASTER}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))

  it("should allow migrating tokens that we own", co(function* () {
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    yield trst.migrateToNewContract(tokensToMigrate, {from: OWNER})
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, tokensToMigrate)
  }))

  it("should not allow migrating after finalization", co(function* () {
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})
    utils.increaseTime(MINIMUM_MIGRATION_DURATION.toNumber() + consts.ONE_WEEK_IN_SECONDS)
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: MIGRATION_MASTER})
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: OWNER}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))
  
})