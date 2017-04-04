'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("Status immediately post-deployment", function(accounts_) {
  let TOTAL_SUPPLY
  let OWNER = accounts_[0]
  let MIGRATION_INFO_SETTER = accounts_[1]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_INFO_SETTER)
    TOTAL_SUPPLY = yield trst.totalSupply.call()
  }))

  // accounts_ is all the accounts that we have in testrpc
  it("should put " + TOTAL_SUPPLY + " (one hundred million plus 6 decimals) Trustcoin in " +
      "msg.sender's account", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_INFO_SETTER)
    let balance = yield trst.balanceOf.call(OWNER)
    return assert.equal(balance.valueOf(), TOTAL_SUPPLY)
  }))

  it("should have the correct migration info setter", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_INFO_SETTER)
    let contractMigrationMaster = yield trst.migrationInfoSetter.call()
    assert.equal(contractMigrationMaster, MIGRATION_INFO_SETTER)
  }))
})
