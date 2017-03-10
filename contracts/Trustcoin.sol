/**
 *  Trustcoin contract, code based on multiple sources:
 *
 *  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20.sol
 *  https://github.com/golemfactory/golem-crowdfunding/tree/master/contracts
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/StandardToken.sol
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/HumanStandardToken.sol
 */

pragma solidity ^0.4.8;

import './deps/ERC20TokenInterface.sol';
import './deps/SafeMath.sol';
import './deps/OutgoingMigrationTokenInterface.sol';
import './deps/IncomingMigrationTokenInterface.sol';

contract Trustcoin is OutgoingMigrationTokenInterface, ERC20TokenInterface, SafeMath {

  string public constant name = 'Trustcoin';
  uint8 public constant decimals = 18; // Same as ETH
  string public constant symbol = 'TRST';
  string public constant version = 'TRST1.0';
  uint256 public constant migrationTimeLimit = 26 weeks;
  uint256 public totalSupply = 100000000; // One hundred million (ERC20)
  uint256 public totalMigrated; // Begins at 0 and increments as tokens are migrated to a new contract
  address public newTokenAddress; // Address of the new token contract
  uint256 public allowOutgoingMigrationsUntilAtLeast;

  mapping(address => uint256) public balances; // (ERC20)
  mapping (address => mapping (address => uint256)) public allowed; // (ERC20)

  address public migrationMaster; // The Ethereum address which is allowed to set the new token

  modifier onlyFromMigrationMaster() {
    if (msg.sender != migrationMaster) throw;
    _;
  }

  function Trustcoin(address _migrationMaster) {
    if (_migrationMaster == 0) throw;
    migrationMaster = _migrationMaster;
  }

  // See ERC20
  function transfer(address _to, uint256 _value) returns (bool success) {
    if (balances[msg.sender] >= _value && _value > 0) {
      balances[msg.sender] -= _value;
      balances[_to] += _value;
      Transfer(msg.sender, _to, _value);
      return true;
    } else { return false; }
  }

  // See ERC20
  function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
    if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
      balances[_to] += _value;
      balances[_from] -= _value;
      allowed[_from][msg.sender] -= _value;
      Transfer(_from, _to, _value);
      return true;
    } else { return false; }
  }

  // See ERC20
  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }

  // See ERC20
  function approve(address _spender, uint256 _value) returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  // See ERC20
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }


  //
  //  Migration methods
  //

  /// Changes the owner for the migration behaviour
  /// @param _master Address of the migration controller
  function changeMigrationMaster(address _master) onlyFromMigrationMaster external {
    if (_master == 0) throw;
    migrationMaster = _master;
  }

  function preventFurtherMigrations() onlyFromMigrationMaster external {
    if (newTokenAddress == 0) throw;
    if (now < allowOutgoingMigrationsUntilAtLeast) throw;
    IncomingMigrationTokenInterface(newTokenAddress).finalizeMigration();
  }
  
  // See OutgoingMigrationTokenInterface
  function setNewTokenAddress(address _newTokenAddress) onlyFromMigrationMaster external {
    if (newTokenAddress != 0) throw; // Ensure we haven't already set the new token
    if (_newTokenAddress == 0) throw;
    newTokenAddress = _newTokenAddress;
    allowOutgoingMigrationsUntilAtLeast = (now + migrationTimeLimit); // Allow migrations for at least the next six months
  }

  // See OutgoingMigrationTokenInterface
  function outgoingMigration(uint256 _value) external {
    if (newTokenAddress == 0) throw; // Ensure that we have set the new token
    if (_value == 0) throw;
    if (_value > balances[msg.sender]) throw;
    balances[msg.sender] = safeSub(balances[msg.sender], _value);
    totalSupply = safeSub(totalSupply, _value);
    totalMigrated = safeAdd(totalMigrated, _value);
    IncomingMigrationTokenInterface(newTokenAddress).incomingMigration(msg.sender, _value);
    OutgoingMigration(msg.sender, _value);
  }

}