pragma solidity ^0.4.7;

//  Abstract contract for tokens which wish to allow optional migrations
//  to a future version

contract OutgoingMigrationTokenInterface {

  uint256 public totalMigrated; // Begins at 0 and increments as tokens are migrated to a new contract
  address public newTokenAddress;
  address public migrationMaster; // The Ethereum address which is allowed to set the new token

  modifier onlyFromMigrationMaster() {
    if (msg.sender != migrationMaster) throw;
    _;
  }
  
  /// Changes the owner for the migration behaviour
  /// @param _master Address of the migration controller
  function changeMigrationMaster(address _master) onlyFromMigrationMaster external;

  /// Sets the address of the new token contract, so we know which
  /// contract to use when minting the newly-migrated tokens
  /// @param _newTokenAddress Address of the new token contract 
  function setNewTokenAddress(address _newTokenAddress) onlyFromMigrationMaster external;
  
  /// Burns the tokens from an address and increments the totalMigrated
  /// by the same value. Also should invoke the method on the new token
  /// which mints and attributes the tokens
  /// @param _value Number of tokens to be migrated
  function outgoingMigration(uint256 _value) external;

  event OutgoingMigration(address owner, uint256 value);

}