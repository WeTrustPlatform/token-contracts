'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Migration Features", function(accounts_) {
  it("should not allow migrating tokens before migration has started", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner, trst.address)
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: migrationMaster}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))
  it("should not allow migrating 0 tokens", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    yield utils.assertThrows(trst.migrateToNewContract(0, {from: owner}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))
  it("should not allow migrating more tokens than we own", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: migrationMaster}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))
  it("should allow migrating tokens that we own", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    yield trst.migrateToNewContract(tokensToMigrate, {from: owner})
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, tokensToMigrate)
  }))
  it("should not allow migrating after finalization", co(function* () {
    let owner = accounts_[0]
    let migrationMaster = accounts_[1]
    let tokensToMigrate = 10
    let trst = yield utils.deployTrustcoin(owner, migrationMaster)
    let trst2 = yield utils.deployExampleTrustcoin2(owner, trst.address)
    yield trst.beginMigrationPeriod(trst2.address, {from: migrationMaster})
    utils.increaseTime(consts.ONE_YEAR_IN_SECONDS)
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: migrationMaster})
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: owner}))
    let newTokenSupply = yield trst2.totalSupply.call()
    assert.equal(newTokenSupply, 0)
  }))
})