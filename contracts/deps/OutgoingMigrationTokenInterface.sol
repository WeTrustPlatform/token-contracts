//  Abstract contract for tokens which wish to allow optional migrations
//  to a future version. This interface does not define permissioning,
//  but it is highly reccommended that some methods are implemented
//  with permissions in mind.

contract OutgoingMigrationTokenInterface {

  /// Getter function for the current total of migrated tokens
  /// @return uint256 Current number of tokens migrated to the new contract
  uint256 public totalMigrated;

  /// Getter function for the new token address
  /// @return address Address of the new token
  address public newTokenAddress;

  /// Begins the migration period to the new version of the token
  /// @param _newTokenAddress Address of the new token contract
  function beginMigrationPeriod(address _newTokenAddress) external;
  
  /// Burns the tokens from an address and increments the totalMigrated
  /// by the same value. Also should invoke the method on the new token
  /// which mints and attributes the tokens.
  /// @param _value Number of tokens to be migrated
  function migrateToNewContract(uint256 _value) external;

  /// Prevents any further migrations from this token to the new token.
  /// Implementations should feel free to ignore this method at their
  /// own discretion.
  function finalizeOutgoingMigration() external;

  event OutgoingMigration(address owner, uint256 value);

}