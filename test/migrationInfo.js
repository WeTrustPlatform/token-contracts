'use strict'

let co = require("co").wrap
let assert = require('chai').assert
let utils = require("./utils/utils.js")

let trst

contract("MigrationInfo", function(accounts_) {
  const OWNER = accounts_[0]
  const MIGRATION_INFO_SETTER = accounts_[1]

  beforeEach(co(function* () {
    trst = yield utils.deployTrustcoin(OWNER, MIGRATION_INFO_SETTER)
  }))

  it("should allow migration info to be changed only by migration info setter",
      co(function* () {
    const NEW_MIGRATION_INFO = "Migration has started, send everything to 0xSomething"

    let oldMigrationInfo = yield trst.migrationInfo.call();
    // Unsuccessful
    yield utils.assertThrows(trst.setMigrationInfo(NEW_MIGRATION_INFO, {from: OWNER}))
    assert.equal(yield trst.migrationInfo.call(), oldMigrationInfo)

    // Here comes the migration info setter - let her in
    yield trst.setMigrationInfo(NEW_MIGRATION_INFO, {from: MIGRATION_INFO_SETTER})
    assert.equal(yield trst.migrationInfo.call(), NEW_MIGRATION_INFO)
  }))

  it("should allow migration info setter to be changed only by migration info setter",
      co(function* () {
    const NEW_MIGRATION_INFO_SETTER = accounts_[9]
    // Unsuccessful
    yield utils.assertThrows(trst.changeMigrationInfoSetter(NEW_MIGRATION_INFO_SETTER, {from: OWNER}))
    assert.equal(yield trst.migrationInfoSetter.call(), MIGRATION_INFO_SETTER)

    // Here comes the migration info setter - let her in
    yield trst.changeMigrationInfoSetter(NEW_MIGRATION_INFO_SETTER, {from: MIGRATION_INFO_SETTER})
    assert.equal(yield trst.migrationInfoSetter.call(), NEW_MIGRATION_INFO_SETTER)
  }))
})
