'use strict'

let assert = require('chai').assert
let co = require("co").wrap
let Promise = require("bluebird");
let utils = require("./utils/utils.js")

contract("Sending and receiving", function(accounts_) {
  let TOTAL_SUPPLY
  let OWNER = accounts_[0]
  let MIGRATION_MASTER = accounts_[1]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    TOTAL_SUPPLY = yield trst.totalSupply.call()
  }))

  it("should transfer coin correctly", co(function* () {
    let amount = 10
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let accountOneStartingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoStartingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)

    let transferEventFired = false
    let transferEvent = trst.Transfer();  // eslint-disable-line new-cap
    transferEvent.watch(function(error, log) {
      assert.isNotOk(error)
      transferEvent.stopWatching();
      transferEventFired = true;
      assert.equal(log.args.from, OWNER);
      assert.equal(log.args.to, MIGRATION_MASTER);
      assert.equal(log.args.value.toNumber(), amount);
    });

    yield trst.transfer(MIGRATION_MASTER, amount, {from: OWNER})

    // A bit of a hack to catch the event.
    yield Promise.delay(300);
    assert.isOk(transferEventFired)

    let accountOneEndingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoEndingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)
    assert.equal(accountOneEndingBalance.toNumber(), accountOneStartingBalance.toNumber() - amount)
    assert.equal(accountTwoEndingBalance.toNumber(), accountTwoStartingBalance.toNumber() + amount)
    let newTotalSupply = yield trst.totalSupply.call()
    assert.equal(newTotalSupply.toNumber(), TOTAL_SUPPLY.toNumber())
  }))

  it("should not allow transferring more than an account's balance", co(function* () {
    let amount = 100
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let accountOneStartingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoStartingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)

    let transferEvent = trst.Transfer();  // eslint-disable-line new-cap
    transferEvent.watch(function(error, log) {
      transferEvent.stopWatching();
      assert.isNotOk(true, "Transfer event fired when it shouldn't have")
    });

    yield trst.transfer(OWNER, accountTwoStartingBalance + amount, {from: MIGRATION_MASTER})

    // Give some time for the testrpc to process the tx and make sure no event has fired.
    Promise.delay(300)
    transferEvent.stopWatching()

    let accountOneEndingBalance = yield trst.balanceOf.call(OWNER)
    let accountTwoEndingBalance = yield trst.balanceOf.call(MIGRATION_MASTER)
    assert.equal(accountOneEndingBalance.toNumber(), accountOneStartingBalance.toNumber())
    assert.equal(accountTwoEndingBalance.toNumber(), accountTwoStartingBalance.toNumber())
    let newTotalSupply = yield trst.totalSupply.call()
    assert.equal(newTotalSupply.toNumber(), TOTAL_SUPPLY.toNumber())
  }))
})
