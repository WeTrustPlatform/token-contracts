'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("Sending and receiving", function(accounts_) {

  let TOTAL_SUPPLY
  let OWNER = accounts_[0]
  let MIGRATION_MASTER = accounts_[1]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    TOTAL_SUPPLY = yield trst.totalSupply.call()
  }))

  it("should send coin correctly", co(function* () {
    let amount = 10
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let accountOneStartingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoStartingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)
    yield trst.transfer(MIGRATION_MASTER, amount, {from: OWNER})
    let accountOneEndingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoEndingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)
    assert.equal(accountOneEndingBalance.toNumber(), accountOneStartingBalance.toNumber() - amount, "Amount wasn't correctly taken from the sender")
    assert.equal(accountTwoEndingBalance.toNumber(), accountTwoStartingBalance.toNumber() + amount, "Amount wasn't correctly sent to the receiver")
    let newTotalSupply = yield trst.totalSupply.call()
    assert.equal(newTotalSupply.toNumber(), TOTAL_SUPPLY.toNumber())
  }))

  it("should not allow sending more than an account's balance", co(function* () {
    let amount = 100
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let accountOneStartingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoStartingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)
    yield trst.transfer(OWNER, accountTwoStartingBalance + amount, {from: MIGRATION_MASTER})
    let accountOneEndingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoEndingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)
    assert.equal(accountOneEndingBalance.toNumber(), accountOneStartingBalance.toNumber(), "Amount was given to the receiver")
    assert.equal(accountTwoEndingBalance.toNumber(), accountTwoStartingBalance.toNumber(), "Amount was taken from the sender")
    let newTotalSupply = yield trst.totalSupply.call()
    assert.equal(newTotalSupply.toNumber(), TOTAL_SUPPLY.toNumber())
  }))

})