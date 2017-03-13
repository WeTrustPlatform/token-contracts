'use strict'

let Trustcoin = artifacts.require("./Trustcoin.sol")

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("Status immediately post-deployment", function(accounts_) {

  // accounts_ is all the accounts that we have in testrpc
  it("should put 100000000 (one hundred million) Trustcoin in the first account", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let balance = yield trst.balanceOf.call(accounts_[0])
    return assert.equal(balance.valueOf(), 100000000, "100000000 wasn't in the first account")
  }))

  it("should have the correct metadata", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let name = yield trst.name.call()
    let decimals = yield trst.decimals.call()
    let symbol = yield trst.symbol.call()
    let version = yield trst.version.call()
    assert.equal(name, 'Trustcoin', "Trustcoin wasn't the found name")
    assert.equal(decimals, 18, "18 wasn't the found number of decimals")
    assert.equal(symbol, 'TRST', "TRST wasn't the found symbol")
    assert.equal(version, 'TRST1.0', "TRST1.0 wasn't the found version")
  }))

  it("should have the correct migration master", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let migrationMaster = yield trst.migrationMaster.call()
    assert.equal(migrationMaster, accounts_[1], "Migration master isn't the correct account")
  }))

  it("should not allow outgoing migrations", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let allowOutgoingMigrations = yield trst.allowOutgoingMigrations.call()
    assert.equal(allowOutgoingMigrations, false, "Outgoing migrations are not disabled")
  }))

  it("should have no newTokenAddress set", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let newTokenAddress = yield trst.newTokenAddress.call()
    assert.equal(newTokenAddress, '0x0000000000000000000000000000000000000000', "New token address is set")
  }))

  it("should have 100000000 (one hundred million) total tokens", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let totalSupply = yield trst.totalSupply.call()
    assert.equal(totalSupply, 100000000, "Total supply is not 100000000")
  }))

  it("should have no tokens migrated yet", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let totalMigrated = yield trst.totalMigrated.call()
    assert.equal(totalMigrated, '0', "Some tokens have been migrated")
  }))

})