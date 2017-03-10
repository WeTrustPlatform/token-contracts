pragma solidity ^0.4.7;

//  Abstract contract for tokens which wish to allow migrations from
//  older versions of themselves

contract IncomingMigrationTokenInterface {

  address public constant oldToken; // Address of the old token contract

  /// Increases the totalSupply of the contract by _value, as well as
  /// attributing that _value to the user with address _from. This call
  /// should only be permitted when msg.sender is the old token
  /// @param _from Address of the user we're migrating the tokens of
  /// @param _value Number of tokens to be migrated
  function incomingMigration(address _from, uint256 _value) external;

  event IncomingMigration(address _from, uint256 _value);

}