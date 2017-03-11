pragma solidity ^0.4.7;

//  Abstract contract for tokens which wish to allow optional migrations
//  to a future version. This interface does not define permissioning,
//  but it is highly reccommended that some methods are implemented
//  with permissions in mind.

contract OutgoingMigrationTokenInterface {

  uint256 public totalMigrated; // Begins at 0 and increments as tokens are migrated to a new contract
  address public newTokenAddress;

  /// Sets the address of the new token contract, so we know which
  /// contract to use when minting the newly-migrated tokens.
  /// @param _newTokenAddress Address of the new token contract
  function setNewTokenAddress(address _newTokenAddress) external;
  
  /// Burns the tokens from an address and increments the totalMigrated
  /// by the same value. Also should invoke the method on the new token
  /// which mints and attributes the tokens.
  /// @param _value Number of tokens to be migrated
  function outgoingMigration(uint256 _value) external;

  /// Prevents any further migrations from this token to the new token.
  /// Implementations should feel free to ignore this method at their
  /// own discretion.
  function finalizeOutgoingMigration() external;

  event OutgoingMigration(address owner, uint256 value);

}