'use strict'

let Promise = require("bluebird")
let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")
let consts = require("./utils/consts.js")

contract("Migration Features", function(accounts_) {

  let MINIMUM_MIGRATION_DURATION
  let TOTAL_SUPPLY
  let OWNER = accounts_[0]
  let MIGRATION_MASTER = accounts_[1]
  let ACCOUNT_ONE = accounts_[2]
  let ACCOUNT_TWO = accounts_[3]
  let ACCOUNT_THREE = accounts_[4]

  before(co(function* () {
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    MINIMUM_MIGRATION_DURATION = yield trst.minimumMigrationDuration.call()
    TOTAL_SUPPLY = yield trst.totalSupply.call()
  }))

  it("should test migration features fully", co(function* () {
    let tokensToHold = 1000
    let tokensToMigrate = tokensToHold / 2
    let trst = yield utils.deployTrustcoin(OWNER, MIGRATION_MASTER)
    let trst2 = yield utils.deployExampleTrustcoin2(OWNER, trst.address)
    yield trst.transfer(ACCOUNT_ONE, tokensToHold, {from: OWNER})
    yield trst.transfer(ACCOUNT_TWO, tokensToHold, {from: OWNER})
    yield trst.transfer(ACCOUNT_THREE, tokensToHold, {from: OWNER})
    yield trst.beginMigrationPeriod(trst2.address, {from: MIGRATION_MASTER})

    // Assert total supply migrations
    yield trst.migrateToNewContract(tokensToMigrate, {from: ACCOUNT_ONE})
    let totalSupplyOldContract = yield trst.totalSupply.call()
    let totalSupplyNewContract = yield trst2.totalSupply.call()
    assert.equal(totalSupplyOldContract.toNumber(), TOTAL_SUPPLY.toNumber() - tokensToMigrate)
    assert.equal(totalSupplyNewContract.toNumber(), tokensToMigrate)
    assert.equal(totalSupplyOldContract.toNumber() + totalSupplyNewContract.toNumber(), TOTAL_SUPPLY.toNumber())

    // Assert balance migrations
    let accountOneBalanceOldContract = yield trst.balanceOf(ACCOUNT_ONE)
    let accountOneBalanceNewContract = yield trst2.balanceOf(ACCOUNT_ONE)
    assert.equal(accountOneBalanceOldContract.toNumber(), tokensToHold - tokensToMigrate)
    assert.equal(accountOneBalanceNewContract.toNumber(), tokensToMigrate)
    assert.equal(accountOneBalanceOldContract.toNumber() + accountOneBalanceNewContract.toNumber(), tokensToHold)

    // Assert migration finalization
    utils.increaseTime(MINIMUM_MIGRATION_DURATION.toNumber() + consts.ONE_WEEK_IN_SECONDS)
    utils.mineOneBlock()
    yield trst.finalizeOutgoingMigration({from: MIGRATION_MASTER})
    yield utils.assertThrows(trst.migrateToNewContract(tokensToMigrate, {from: ACCOUNT_TWO}))

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