'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let Promise = require("bluebird");
let utils = require("./utils/utils.js")

contract("approve, allowance and transferFrom", function(accounts_) {
  let DEPLOYER_ACCOUNT = accounts_[0]
  let OWNER_ACCOUNT = accounts_[1]
  let SPENDER_ACCOUNT = accounts_[2]
  let RECEIVING_ACCOUNT = accounts_[3]
  let MIGRATION_MASTER = accounts_[9]

  const INITIAL_AMOUNT = 10
  const APPROVED_AMOUNT = 4

  it("should allow other users to be approved to move tokens", co(function* () {
    let trst = yield utils.deployTrustcoin(DEPLOYER_ACCOUNT, MIGRATION_MASTER)
    yield trst.transfer(OWNER_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    yield trst.transfer(SPENDER_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    yield trst.transfer(RECEIVING_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    let ownerAccountStartBal = yield trst.balanceOf.call(OWNER_ACCOUNT)
    let receivingAccountStartBal = yield trst.balanceOf.call(RECEIVING_ACCOUNT)

    // Approve and check allowance
    let approvalEventFired = false
    let approvalEvent = trst.Approval();  // eslint-disable-line new-cap
    approvalEvent.watch(function(error, log) {
      assert.isNotOk(error)
      approvalEvent.stopWatching();
      approvalEventFired = true;
      assert.equal(log.args.owner, OWNER_ACCOUNT);
      assert.equal(log.args.spender, SPENDER_ACCOUNT);
      assert.equal(log.args.value.toNumber(), APPROVED_AMOUNT)
    });

    yield trst.approve(SPENDER_ACCOUNT, APPROVED_AMOUNT, {from: OWNER_ACCOUNT})
    let actualApprovalForSpendingAccount = yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)
    assert.equal(actualApprovalForSpendingAccount.toNumber(), APPROVED_AMOUNT)
    // A bit of a hack to catch the event.
    yield Promise.delay(300);
    assert.isOk(approvalEventFired)


    // Transfer in 2 txs:
    // First transfer tx
    let transfer1EventFired = false
    let transfer1Event = trst.Transfer();  // eslint-disable-line new-cap
    transfer1Event.watch(function(error, log) {
      assert.isNotOk(error)
      transfer1Event.stopWatching();
      transfer1EventFired = true;
      assert.equal(log.args.from, OWNER_ACCOUNT);
      assert.equal(log.args.to, RECEIVING_ACCOUNT);
      assert.equal(log.args.value.toNumber(), FIRST_TRANSFERRED_AMOUNT);
    });
    const FIRST_TRANSFERRED_AMOUNT = APPROVED_AMOUNT - 1
    yield trst.transferFrom(
      OWNER_ACCOUNT, RECEIVING_ACCOUNT, FIRST_TRANSFERRED_AMOUNT, {from: SPENDER_ACCOUNT})

    yield Promise.delay(300);
    assert.isOk(transfer1EventFired)
    assert.equal(yield trst.balanceOf.call(OWNER_ACCOUNT),
                 ownerAccountStartBal.toNumber() - FIRST_TRANSFERRED_AMOUNT)
    assert.equal((yield trst.balanceOf.call(RECEIVING_ACCOUNT)).toNumber(),
                 receivingAccountStartBal.toNumber() + FIRST_TRANSFERRED_AMOUNT)
    actualApprovalForSpendingAccount = yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)

    // Second transfer tx
    let transfer2EventFired = false
    let transfer2Event = trst.Transfer();  // eslint-disable-line new-cap
    transfer2Event.watch(function(error, log) {
      assert.isNotOk(error)
      transfer2Event.stopWatching();
      transfer2EventFired = true;
      assert.equal(log.args.from, OWNER_ACCOUNT);
      assert.equal(log.args.to, RECEIVING_ACCOUNT);
      assert.equal(log.args.value.toNumber(), REMAINDER_TRANSFERRED_AMOUNT);
    });

    const REMAINDER_TRANSFERRED_AMOUNT = APPROVED_AMOUNT - FIRST_TRANSFERRED_AMOUNT
    yield trst.transferFrom(
      OWNER_ACCOUNT, RECEIVING_ACCOUNT, REMAINDER_TRANSFERRED_AMOUNT, {from: SPENDER_ACCOUNT})
    yield Promise.delay(300);
    assert.isOk(transfer2EventFired)
    assert.equal((yield trst.balanceOf.call(OWNER_ACCOUNT)).toNumber(),
                 INITIAL_AMOUNT - APPROVED_AMOUNT)
    assert.equal((yield trst.balanceOf.call(RECEIVING_ACCOUNT)).toNumber(),
                 receivingAccountStartBal.toNumber() + APPROVED_AMOUNT)

    assert.equal(yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT), 0)
  }))

  it("should not allow transferring more than an account's approved balance", co(function* () {
    let trst = yield utils.deployTrustcoin(DEPLOYER_ACCOUNT, MIGRATION_MASTER)
    yield trst.transfer(OWNER_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    yield trst.transfer(SPENDER_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    yield trst.transfer(RECEIVING_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    let ownerAccountStartBal = yield trst.balanceOf.call(OWNER_ACCOUNT)
    let receivingAccountStartBal = yield trst.balanceOf.call(RECEIVING_ACCOUNT)

    yield trst.approve(SPENDER_ACCOUNT, APPROVED_AMOUNT, {from: OWNER_ACCOUNT})
    let actualApprovalForSpendingAccount = yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)
    assert.equal(actualApprovalForSpendingAccount.toNumber(), APPROVED_AMOUNT)

    yield trst.transferFrom(OWNER_ACCOUNT, RECEIVING_ACCOUNT, APPROVED_AMOUNT + 1, {from: SPENDER_ACCOUNT})
    actualApprovalForSpendingAccount = yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)
    assert.equal(actualApprovalForSpendingAccount.toNumber(), APPROVED_AMOUNT)

    // See no funds have been transferred
    let ownerAccountEndBal = yield trst.balanceOf.call(OWNER_ACCOUNT)
    assert.equal(ownerAccountEndBal.toNumber(), ownerAccountStartBal.toNumber())
    let receivingAccountEndBal = yield trst.balanceOf.call(RECEIVING_ACCOUNT)
    assert.equal(receivingAccountEndBal.toNumber(), receivingAccountStartBal.toNumber())
  }))

  it("should not allow transferring more than an account's balance even if allowance is greater", co(function* () {
    let trst = yield utils.deployTrustcoin(DEPLOYER_ACCOUNT, MIGRATION_MASTER)
    // Let owner have less than the approved amount.
    yield trst.transfer(OWNER_ACCOUNT, APPROVED_AMOUNT - 1, {from: DEPLOYER_ACCOUNT})
    yield trst.transfer(RECEIVING_ACCOUNT, INITIAL_AMOUNT, {from: DEPLOYER_ACCOUNT})
    let ownerAccountStartBal = yield trst.balanceOf.call(OWNER_ACCOUNT)
    let receivingAccountStartBal = yield trst.balanceOf.call(RECEIVING_ACCOUNT)

    yield trst.approve(SPENDER_ACCOUNT, APPROVED_AMOUNT, {from: OWNER_ACCOUNT})

    yield trst.transferFrom(OWNER_ACCOUNT, RECEIVING_ACCOUNT, APPROVED_AMOUNT, {from: SPENDER_ACCOUNT})

    // Transfer should fail because transfer amount was more than the balance.
    let actualApprovalForSpendingAccount =
        (yield trst.allowance(OWNER_ACCOUNT, SPENDER_ACCOUNT)).toNumber()
    assert.equal(actualApprovalForSpendingAccount, APPROVED_AMOUNT)

    // No funds should have been transferred
    let ownerAccountEndBal = yield trst.balanceOf.call(OWNER_ACCOUNT)
    assert.equal(ownerAccountEndBal.toNumber(), ownerAccountStartBal.toNumber())
    let receivingAccountEndBal = yield trst.balanceOf.call(RECEIVING_ACCOUNT)
    assert.equal(receivingAccountEndBal.toNumber(), receivingAccountStartBal.toNumber())
  }))
})
