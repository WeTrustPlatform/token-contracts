/**
 *  TRST Trustcoin contract, code based on multiple sources:
 *
 *  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20.sol
 *  https://github.com/golemfactory/golem-crowdfunding/tree/master/contracts
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/StandardToken.sol
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/HumanStandardToken.sol
 */

pragma solidity ^0.4.8;

import './deps/ERC20TokenInterface.sol';
import './deps/OutgoingMigrationTokenInterface.sol';
import './deps/IncomingMigrationTokenInterface.sol';

contract Trustcoin is OutgoingMigrationTokenInterface, ERC20TokenInterface {

  string public constant name = 'Trustcoin';
  uint256 public constant decimals = 6;
  string public constant symbol = 'TRST';
  string public constant version = 'TRST1.0';
  uint256 public constant minimumMigrationDuration = 26 weeks; // Minimum allowed migration period
  uint256 private totalTokens = 100000000 * (10 ** decimals); // One hundred million
  uint256 public totalMigrated; // Begins at 0 and increments as tokens are migrated to a new contract
  IncomingMigrationTokenInterface public newToken;
  uint256 public allowOutgoingMigrationsUntilAtLeast;
  bool public allowOutgoingMigrations = false;
  address public migrationMaster; // The Ethereum address which is allowed to set the new token's address

  mapping (address => uint256) public balances; // (ERC20)
  mapping (address => mapping (address => uint256)) public allowed; // (ERC20)

  modifier onlyFromMigrationMaster() {
    if (msg.sender != migrationMaster) throw;
    _;
  }

  function Trustcoin(address _migrationMaster) {
    if (_migrationMaster == 0) throw;
    migrationMaster = _migrationMaster;
    balances[msg.sender] = totalTokens;
  }

  // See ERC20
  function totalSupply() constant returns (uint256) {
    return totalTokens;
  }

  // See ERC20
  // WARNING: If you call this with the address of a contract, the contract will receive the
  // funds, but will have no idea where they came from. Furthermore, if the contract is
  // not aware of TRST, the tokens will remain locked away in the contract forever.
  // It is therefore recommended to call compareAndApprove() or approve() and have the contract
  // withdraw the money using transferFrom().
  function transfer(address _to, uint256 _value) external returns (bool) {
    if (balances[msg.sender] >= _value && _value > 0) {
      balances[msg.sender] -= _value;
      balances[_to] += _value;
      Transfer(msg.sender, _to, _value);
      return true;
    }
    return false;
  }

  // See ERC20
  function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
    if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
      balances[_to] += _value;
      balances[_from] -= _value;
      allowed[_from][msg.sender] -= _value;
      Transfer(_from, _to, _value);
      return true;
    }
    return false;
  }

  // See ERC20
  function balanceOf(address _owner) constant external returns (uint256) {
    return balances[_owner];
  }

  // See ERC20
  // NOTE: this method is vulnerable and is placed here only to follow the ERC20 standard.
  // Before using, please take a look at the better compareAndApprove below.
  function approve(address _spender, uint256 _value) external returns (bool) {
    return doApprove(_spender, _value);
  }

  // A vulernability of the approve method in the ERC20 standard was identified by
  // Mikhail Vladimirov and Dmitry Khovratovich in this Google Doc:
  // https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM
  // It's better to use this method which is not susceptible to over-withdrawing by the approvee.
  /// @param _spender The address to approve
  /// @param _currentValue The previous value approved, which can be retrieved with allowance(msg.sender, _spender)
  /// @param _newValue The new value to approve, this will replace the _currentValue
  /// @return bool Whether the approval was a success (see ERC20's `approve`)
  function compareAndApprove(address _spender, uint256 _currentValue, uint256 _newValue) public returns(bool) {
    if (allowed[msg.sender][_spender] != _currentValue) {
      return false;
    }
    return doApprove(_spender, _newValue);
  }

  // See ERC20
  function allowance(address _owner, address _spender) constant external returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

  //
  //  Migration methods
  //

  /// Changes the owner for the migration behaviour
  /// @param _master Address of the user who has control of setting the new token's address
  function changeMigrationMaster(address _master) onlyFromMigrationMaster public {
    if (_master == 0) throw;
    migrationMaster = _master;
  }

  // See OutgoingMigrationTokenInterface
  function finalizeOutgoingMigration() onlyFromMigrationMaster public {
    if (!allowOutgoingMigrations) throw;
    if (now < allowOutgoingMigrationsUntilAtLeast) throw;
    newToken.finalizeIncomingMigration();
    allowOutgoingMigrations = false;
  }

  // See OutgoingMigrationTokenInterface
  function beginMigrationPeriod(address _newTokenAddress) onlyFromMigrationMaster public {
    if (allowOutgoingMigrations) throw; // Ensure we haven't already started allowing migrations
    if (_newTokenAddress == 0) throw;
    if (newTokenAddress != 0) throw;
    newTokenAddress = _newTokenAddress;
    newToken = IncomingMigrationTokenInterface(newTokenAddress);
    allowOutgoingMigrationsUntilAtLeast = (now + minimumMigrationDuration);
    allowOutgoingMigrations = true;
  }

  // See OutgoingMigrationTokenInterface
  function migrateToNewContract(uint256 _value) public {
    if (!allowOutgoingMigrations) throw;
    if (_value == 0) throw;
    balances[msg.sender] -= _value;
    totalTokens -= _value;
    totalMigrated += _value;
    newToken.migrateFromOldContract(msg.sender, _value);
    OutgoingMigration(msg.sender, _value);
  }

  //
  // Internal functions
  //

  // Performs the equivalent of a successful call to ERC20's approve method, but is used
  // internally by our compareAndApprove method
  /// @param _spender The address to approve
  /// @param _value The value to approve, this replaces any old value
  /// @return bool Whether the approval was a success
  function doApprove(address _spender, uint256 _value) internal returns (bool) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

}
