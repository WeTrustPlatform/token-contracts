pragma solidity ^0.4.7;

contract MigratableTokenInterface {

  uint256 public totalMigrated; // Begins at 0 and increments as tokens are migrated to a new contract
  address public newTokenAddress;
  address public migrationMaster;

  modifier onlyFromMigrationMaster(address _from) {
    if (_from != migrationMaster) throw;
    _;
  }
  
  /// Changes the owner for the migration behaviour
  /// @param _master Address of the migration controller
  function changeMigrationMaster(address _master) onlyFromMigrationMaster(msg.sender) external;

  /// Sets the address of the new token contract, so we know who to
  /// accept discardTokens() calls from, and enables token migrations
  /// @param _newTokenAddress Address of the new Trustcoin contract 
  function setNewTokenAddress(address _newTokenAddress) onlyFromMigrationMaster(msg.sender) external;
  
  /// Burns the tokens from an address and increments the totalMigrated
  /// by the same value. Called by users who want to migrate their tokens
  /// @param _value Number of tokens to be migrated
  function discardTokens(uint256 _value) external;

  event OutgoingMigration(address owner, uint256 value);

}