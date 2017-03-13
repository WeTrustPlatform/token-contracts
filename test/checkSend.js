'use strict'

let Trustcoin = artifacts.require("./Trustcoin.sol")

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("Sending and receiving", function(accounts_) {
  it("should send coin correctly", co(function* () {
    // Get initial balances of first and second account.
    let accOne = accounts_[0]
    let accTwo = accounts_[1]
    let amount = 10
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let accOneStartingBal = yield trst.balanceOf.call(accOne)
    let accTwoStartingBal = yield trst.balanceOf.call(accTwo)
    yield trst.transfer(accTwo, amount, {from: accOne})
    let accOneEndingBal = yield trst.balanceOf.call(accOne)
    let accTwoEndingBal = yield trst.balanceOf.call(accTwo)
    assert.equal(accOneEndingBal.toNumber(), accOneStartingBal.toNumber() - amount, "Amount wasn't correctly taken from the sender")
    assert.equal(accTwoEndingBal.toNumber(), accTwoStartingBal.toNumber() + amount, "Amount wasn't correctly sent to the receiver")
  }))
  it("should not allow sending more than an account's balance", co(function* () {
    // Get initial balances of first and second account.
    let accOne = accounts_[0]
    let accTwo = accounts_[1]
    let accOneStartingBal
    let accTwoStartingBal
    let accOneEndingBal
    let accTwoEndingBal
    let amount = 10
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    accOneStartingBal = yield trst.balanceOf.call(accOne)
    accTwoStartingBal = yield trst.balanceOf.call(accTwo)
    yield trst.transfer(accTwo, amount, {from: accOne})
    accOneEndingBal = yield trst.balanceOf.call(accOne)
    accTwoEndingBal = yield trst.balanceOf.call(accTwo)
    assert.equal(accOneEndingBal.toNumber(), accOneStartingBal.toNumber() - amount, "Amount wasn't correctly taken from the sender")
    assert.equal(accTwoEndingBal.toNumber(), accTwoStartingBal.toNumber() + amount, "Amount wasn't correctly sent to the receiver")
  }))
})