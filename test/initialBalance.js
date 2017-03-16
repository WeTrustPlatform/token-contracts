'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

const TOTAL_SUPPLY = 100000000000000 // 1e14

contract("Status immediately post-deployment", function(accounts_) {

  // accounts_ is all the accounts that we have in testrpc
  it("should put " + TOTAL_SUPPLY + " (one hundred million plus 6 decimals) Trustcoin in msg.sender's account", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let balance = yield trst.balanceOf.call(accounts_[0])
    return assert.equal(balance.valueOf(), TOTAL_SUPPLY)
  }))

  it("should have the correct migration master", co(function* () {
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let migrationMaster = yield trst.migrationMaster.call()
    assert.equal(migrationMaster, accounts_[1])
  }))

})