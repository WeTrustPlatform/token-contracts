pragma solidity ^0.4.7;

contract MigratedTokenInterface {

  /**
   *  Migrates the specified token balance from msg.sender in the old contract
   *  to the new contract
   *  @param _from Address of the user we're migrating the tokens of
   *  @param _value Number of tokens to be migrated
   */
  function migrateOldTokens(address _from, uint256 _value) external;

  event IncomingMigration(address _from, uint256 _value);

}