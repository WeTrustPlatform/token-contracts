//  Abstract contract for tokens which wish to allow optional migrations
//  to a future version. This interface does not define permissioning,
//  but it is highly reccommended that some methods are implemented
//  with permissions in mind.
pragma solidity ^0.4.7;

contract OutgoingMigrationTokenInterface {

  /// Current total of migrated tokens.
  uint256 public totalMigrated;

  /// The new token address, publicly verifiable.
  address public newTokenAddress;

  /// Begins the migration period to the new version of the token.
  /// @param _newTokenAddress Address of the new token contract
  function beginMigrationPeriod(address _newTokenAddress) public;

  /// Burns the tokens from an address and increments the totalMigrated
  /// by the same value. Also should invoke the method on the new token
  /// which mints and attributes the tokens.
  /// @param _value Number of tokens to be migrated
  function migrateToNewContract(uint256 _value) public;

  /// Prevents any further migrations from this token to the new token.
  /// Implementations should feel free to ignore this method at their
  /// own discretion.
  function finalizeOutgoingMigration() public;

  event OutgoingMigration(address owner, uint256 value);

}
