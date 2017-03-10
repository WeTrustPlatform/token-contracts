pragma solidity ^0.4.7;

contract IncomingMigrationTokenInterface {

  /// Increases the totalSupply of the contract by _value, as well as
  /// attributing that _value to the user with address _from
  /// @param _from Address of the user we're migrating the tokens of
  /// @param _value Number of tokens to be migrated
  function incomingMigration(address _from, uint256 _value) external;

  event IncomingMigration(address _from, uint256 _value);

}