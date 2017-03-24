'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("Approving and transferring", function(accounts_) {
  let TOTAL_SUPPLY
  let OWNER = accounts_[0]
  let ACCOUNT_ONE = accounts_[1]
  let ACCOUNT_TWO = accounts_[2]
  let ACCOUNT_THREE = accounts_[3]
  let MIGRATION_MASTER = accounts_[9]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    TOTAL_SUPPLY = yield trst.totalSupply.call()
  }))

  it("should allow other users to be approved to move tokens", co(function* () {
    let initialAmount = 10
    let approvedAmount = 5
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    yield trst.transfer(ACCOUNT_ONE, initialAmount, {from: OWNER})
    yield trst.transfer(ACCOUNT_TWO, initialAmount, {from: OWNER})
    yield trst.transfer(ACCOUNT_THREE, initialAmount, {from: OWNER})
    let accountOneStartingBalance = yield trst.balanceOf.call(ACCOUNT_ONE)
    let accountTwoStartingBalance = yield trst.balanceOf.call(ACCOUNT_TWO)
    let accountThreeStartingBalance = yield trst.balanceOf.call(ACCOUNT_THREE)

    yield trst.approve(ACCOUNT_TWO, approvedAmount, {from: ACCOUNT_ONE})
    let approvedForAccountTwo = yield trst.allowance(ACCOUNT_ONE, ACCOUNT_TWO)
    assert.equal(approvedForAccountTwo.toNumber(), approvedAmount)

    yield trst.transferFrom(ACCOUNT_ONE, ACCOUNT_THREE, approvedAmount, {from: ACCOUNT_TWO})
    let accountThreeEndingBalance = yield trst.balanceOf.call(ACCOUNT_THREE)
    assert.equal(accountThreeEndingBalance.toNumber(), (accountThreeStartingBalance.toNumber() + approvedAmount))
    approvedForAccountTwo = yield trst.allowance(ACCOUNT_ONE, ACCOUNT_TWO)
    assert.equal(approvedForAccountTwo.toNumber(), 0)
  }))

  it("should not allow transferring more than an account's approved balance", co(function* () {
    let initialAmount = 10
    let approvedAmount = 5
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    yield trst.transfer(ACCOUNT_ONE, initialAmount, {from: OWNER})
    yield trst.transfer(ACCOUNT_TWO, initialAmount, {from: OWNER})
    yield trst.transfer(ACCOUNT_THREE, initialAmount, {from: OWNER})
    let accountOneStartingBalance = yield trst.balanceOf.call(ACCOUNT_ONE)
    let accountTwoStartingBalance = yield trst.balanceOf.call(ACCOUNT_TWO)
    let accountThreeStartingBalance = yield trst.balanceOf.call(ACCOUNT_THREE)

    yield trst.approve(ACCOUNT_TWO, approvedAmount, {from: ACCOUNT_ONE})
    let approvedForAccountTwo = yield trst.allowance(ACCOUNT_ONE, ACCOUNT_TWO)
    assert.equal(approvedForAccountTwo.toNumber(), approvedAmount)

    yield trst.transferFrom(ACCOUNT_ONE, ACCOUNT_THREE, approvedAmount + 1, {from: ACCOUNT_TWO})
    approvedForAccountTwo = yield trst.allowance(ACCOUNT_ONE, ACCOUNT_TWO)
    assert.equal(approvedForAccountTwo.toNumber(), approvedAmount) // Assure none of the tokens moved

    let accountThreeEndingBalance = yield trst.balanceOf.call(ACCOUNT_THREE)
    assert.equal(accountThreeEndingBalance.toNumber(), accountThreeStartingBalance.toNumber())
  }))
})
