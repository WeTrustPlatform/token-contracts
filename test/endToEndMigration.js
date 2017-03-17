'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Migration Features", function(accounts_) {
  let MINIMUM_MIGRATION_DURATION
  let TOTAL_SUPPLY
  const OWNER = accounts_[0]
  const MIGRATION_MASTER = accounts_[1]
  const ACCOUNT_ONE = accounts_[2]
  const ACCOUNT_TWO = accounts_[3]
  const ACCOUNT_THREE = accounts_[4]
  const TOKENS_TO_HOLD = 1000
  const TOKENS_TO_MIGRATE = 500

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    MINIMUM_MIGRATION_DURATION = yield trst.minimumMigrationDuration.call()
    TOTAL_SUPPLY = yield trst.totalSupply.call()
  }))

  it("should test migration features fully", co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.transfer(ACCOUNT_ONE, TOKENS_TO_HOLD, {from: OWNER})
    yield trst.transfer(ACCOUNT_TWO, TOKENS_TO_HOLD, {from: OWNER})
    yield trst.transfer(ACCOUNT_THREE, TOKENS_TO_HOLD, {from: OWNER})
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})

    // Assert total supply migrations
    yield trst.migrateToNewContract(TOKENS_TO_MIGRATE, {from: ACCOUNT_ONE})
    let totalSupplyOldContract = yield trst.totalSupply.call()
    let totalSupplyNewContract = yield trst2.totalSupply.call()
    assert.equal(totalSupplyOldContract.toNumber(), TOTAL_SUPPLY.toNumber() - TOKENS_TO_MIGRATE)
    assert.equal(totalSupplyNewContract.toNumber(), TOKENS_TO_MIGRATE)
    assert.equal(totalSupplyOldContract.toNumber() + totalSupplyNewContract.toNumber(), TOTAL_SUPPLY.toNumber())

    // Assert balance migrations
    let accountOneBalanceOldContract = yield trst.balanceOf(ACCOUNT_ONE)
    let accountOneBalanceNewContract = yield trst2.balanceOf(ACCOUNT_ONE)
    assert.equal(accountOneBalanceOldContract.toNumber(), TOKENS_TO_HOLD - TOKENS_TO_MIGRATE)
    assert.equal(accountOneBalanceNewContract.toNumber(), TOKENS_TO_MIGRATE)
    assert.equal(accountOneBalanceOldContract.toNumber() + accountOneBalanceNewContract.toNumber(), TOKENS_TO_HOLD)

    // Assert migration finalization
    utils.increaseTime(MINIMUM_MIGRATION_DURATION.toNumber() + consts.ONE_WEEK_IN_SECONDS)
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: MIGRATION_MASTER})
    yield utils.assertThrows(trst.migrateToNewContract(TOKENS_TO_MIGRATE, {from: ACCOUNT_TWO}))

    // Assert old contract transfers
    let accountTwoBalanceOldContract = yield trst.balanceOf(ACCOUNT_TWO)
    let accountThreeBalanceOldContract = yield trst.balanceOf(ACCOUNT_THREE)
    yield trst.transfer(ACCOUNT_THREE, accountTwoBalanceOldContract.toNumber(), {from: ACCOUNT_TWO})
    let accountThreeBalanceOldContractShouldBe =
      accountTwoBalanceOldContract.toNumber() +
      accountThreeBalanceOldContract.toNumber()
    accountThreeBalanceOldContract = yield trst.balanceOf(ACCOUNT_THREE) // Get it again, post-transfer
    assert.equal(accountThreeBalanceOldContract.toNumber(), accountThreeBalanceOldContractShouldBe)

    // Assert new contract transfers
    accountOneBalanceNewContract = yield trst2.balanceOf(ACCOUNT_ONE) // Re-get this, just to be sure
    let accountTwoBalanceNewContract = yield trst2.balanceOf(ACCOUNT_TWO)
    yield trst2.transfer(ACCOUNT_TWO, accountOneBalanceNewContract.toNumber(), {from: ACCOUNT_ONE})
    let accountTwoBalanceNewContractShouldBe =
      accountOneBalanceNewContract.toNumber() +
      accountTwoBalanceNewContract.toNumber()
    accountTwoBalanceNewContract = yield trst2.balanceOf(ACCOUNT_TWO) // Get it again, post-transfer
    assert.equal(accountTwoBalanceNewContract.toNumber(), accountTwoBalanceNewContractShouldBe)
  }))
})
