'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("Sending and receiving", function(accounts_) {

  it("should send coin correctly", co(function* () {
    let accountOne = accounts_[0]
    let accountTwo = accounts_[1]
    let amount = 10
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let oldTotalSupply = yield trst.totalSupply.call()
    let accountOneStartingBalance = yield trst.balanceOf.call(accountOne)
    let accountTwoStartingBalance = yield trst.balanceOf.call(accountTwo)
    yield trst.transfer(accountTwo, amount, {from: accountOne})
    let accountOneEndingBalance = yield trst.balanceOf.call(accountOne)
    let accountTwoEndingBalance = yield trst.balanceOf.call(accountTwo)
    assert.equal(accountOneEndingBalance.toNumber(), accountOneStartingBalance.toNumber() - amount, "Amount wasn't correctly taken from the sender")
    assert.equal(accountTwoEndingBalance.toNumber(), accountTwoStartingBalance.toNumber() + amount, "Amount wasn't correctly sent to the receiver")
    let newTotalSupply = yield trst.totalSupply.call()
    assert.equal(newTotalSupply.toNumber(), oldTotalSupply.toNumber())
  }))

  it("should not allow sending more than an account's balance", co(function* () {
    let accountOne = accounts_[0]
    let accountTwo = accounts_[1]
    let amount = 100
    let trst = yield utils.deployTrustcoin(accounts_[0], accounts_[1])
    let oldTotalSupply = yield trst.totalSupply.call()
    let accountOneStartingBalance = yield trst.balanceOf.call(accountOne)
    let accountTwoStartingBalance = yield trst.balanceOf.call(accountTwo)
    yield trst.transfer(accountOne, accountTwoStartingBalance + amount, {from: accountTwo})
    let accountOneEndingBalance = yield trst.balanceOf.call(accountOne)
    let accountTwoEndingBalance = yield trst.balanceOf.call(accountTwo)
    assert.equal(accountOneEndingBalance.toNumber(), accountOneStartingBalance.toNumber(), "Amount was given to the receiver")
    assert.equal(accountTwoEndingBalance.toNumber(), accountTwoStartingBalance.toNumber(), "Amount was taken from the sender")
    let newTotalSupply = yield trst.totalSupply.call()
    assert.equal(newTotalSupply.toNumber(), oldTotalSupply.toNumber())
  }))

})