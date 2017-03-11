pragma solidity ^0.4.7;

//  Abstract contract for tokens which wish to allow migrations from
//  older versions of themselves. This interface does not define permissioning,
//  but it is highly reccommended that some methods are implemented
//  with permissions in mind.

contract IncomingMigrationTokenInterface {

  address public oldToken; // Address of the old token contract

  /// Increases the totalSupply of the contract by _value, as well as
  /// attributing that _value to the user with address _from. This call
  /// should only be permitted when msg.sender is the old token.
  /// @param _from Address of the user we're migrating the tokens of
  /// @param _value Number of tokens to be migrated
  function incomingMigration(address _from, uint256 _value) external;

  /// Ends the possibility for any more tokens to be migrated from the old
  /// contract to the new one. It's not strictly necessary to have our own
  /// flag for whether migrations are permitted or not, but it helps the token 
  /// contract be self-contained. Implementations of this should feel free to
  /// ignore this functionality at their own discretion.
  function finalizeIncomingMigration() external;

  event IncomingMigration(address _from, uint256 _value);

}