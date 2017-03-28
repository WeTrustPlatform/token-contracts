'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

contract("compareAndApprove", function(accounts_) {
  let DEPLOYER_ACCOUNT = accounts_[0]
  let OWNER_ACCOUNT = accounts_[1]
  let SPENDER_ACCOUNT = accounts_[2]
  let MIGRATION_MASTER = accounts_[9]

  const APPROVED_AMOUNT1 = 4
  const APPROVED_AMOUNT2 = 6

  it("should allow approving only if oldValue is correct", co(function* () {
    // This test assumes that one allowance() returns the right value, then any bugs down the
    // road would be caught by the approve.js test.
    let trst = yield utils.deployTrustcoin(DEPLOYER_ACCOUNT, MIGRATION_MASTER)

    // Default old value is 0. This should therefore not be approved.
    yield trst.compareAndApprove(SPENDER_ACCOUNT, 5, APPROVED_AMOUNT1, {from: OWNER_ACCOUNT})
    assert.equal((yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)).toNumber(), 0)

    // Correct old value, make sure it's approved.
    yield trst.compareAndApprove(SPENDER_ACCOUNT, 0, APPROVED_AMOUNT1, {from: OWNER_ACCOUNT})
    assert.equal(
      (yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)).toNumber(), APPROVED_AMOUNT1)

    // Wrong old value (when old value isn't 0)
    yield trst.compareAndApprove(
       SPENDER_ACCOUNT, APPROVED_AMOUNT1 + 1, APPROVED_AMOUNT2, {from: OWNER_ACCOUNT})
    assert.equal(
      (yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)).toNumber(), APPROVED_AMOUNT1)

    // Correct old value, make sure it's approved.
    yield trst.compareAndApprove(
        SPENDER_ACCOUNT, APPROVED_AMOUNT1, APPROVED_AMOUNT2, {from: OWNER_ACCOUNT})
    assert.equal(
      (yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)).toNumber(), APPROVED_AMOUNT2)
  }))
})
