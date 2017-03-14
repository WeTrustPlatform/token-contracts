pragma solidity ^0.4.7;

//  Abstract contract for tokens which wish to allow migrations from
//  older versions of themselves. This interface does not define permissioning,
//  but it is highly reccommended that some methods are implemented
//  with permissions in mind.

contract IncomingMigrationTokenInterface {

  /// Getter function for the old token address
  /// @return address Address of the old token
  // function oldTokenAddress() external returns (address);
  address public oldTokenAddress;

  /// Increases the totalSupply of the contract by _value, as well as
  /// attributing that _value to the user with address _from. This call
  /// should only be permitted when msg.sender is the old token.
  /// @param _from Address of the user we're migrating the tokens of
  /// @param _value Number of tokens to be migrated
  function migrateFromOldContract(address _from, uint256 _value) external;

  /// Ends the possibility for any more tokens to be migrated from the old
  /// contract to the new one. It's not strictly necessary to have our own
  /// flag for whether migrations are permitted or not, but it helps the token 
  /// contract be self-contained. Also means anyone listening to contract events
  /// only has to listen to the new contract to know when finalization happens.
  /// Implementations of this should feel free to ignore this functionality at
  /// their own discretion.
  function finalizeIncomingMigration() external;

  event IncomingMigration(address _from, uint256 _value);

}