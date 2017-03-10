/**
 *  Example 'New' Trustcoin contract, code based on multiple sources:
 *
 *  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20.sol
 *  https://github.com/golemfactory/golem-crowdfunding/tree/master/contracts
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/HumanStandardToken.sol
 */

pragma solidity ^0.4.8;

import './deps/ERC20TokenInterface.sol';
import './deps/IncomingMigrationTokenInterface.sol';
import './deps/OutgoingMigrationTokenInterface.sol';
import './deps/SafeMath.sol';
import './Trustcoin.sol';

contract ExampleTrustcoin2 is OutgoingMigrationTokenInterface, IncomingMigrationTokenInterface, ERC20TokenInterface, SafeMath {

  string public constant name = 'Trustcoin2';
  uint8 public constant decimals = 18; // Same as ETH
  string public constant symbol = 'TRST2';
  string public constant version = 'TRST2.0';
  uint256 public totalSupply = 0; // Begins at 0, but increments as old tokens are migrated into this contract (ERC20)
  address public constant oldToken = 0x6651fdb9d5d15ca55cc534ee5fa6c3432acdf15b; // Address of our old Trustcoin token contract (this is just a random address)
  bool public allowIncomingMigrations = true; // Is set to false when we finalize migration
  uint256 public allowOutgoingMigrationsUntil; // Allows us to set a 'deadline' for migrating old tokens

  mapping(address => uint256) public balances; // (ERC20)
  mapping (address => mapping (address => uint256)) public allowed; // (ERC20)

  // Variables supporting the migration to a new contract (Trustcoin3)
  uint256 public totalMigrated;
  address public migrationMaster;
  address public newTokenAddress;

  event MigrationFinalized();

  function Trustcoin2(address _migrationMaster) {
    if (_migrationMaster == 0) throw;
    migrationMaster = _migrationMaster;
  }

  // See ERC20
  function transfer(address _to, uint _value) external returns (bool success) {
    balances[msg.sender] = safeSub(balances[msg.sender], _value);
    balances[_to] = safeAdd(balances[_to], _value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  // See ERC20
  function transferFrom(address _from, address _to, uint _value) external returns (bool success) {
    uint256 _allowance = allowed[_from][msg.sender];
    balances[_to] = safeAdd(balances[_to], _value);
    balances[_from] = safeSub(balances[_from], _value);
    allowed[_from][msg.sender] = safeSub(_allowance, _value);
    Transfer(_from, _to, _value);
    return true;
  }

  // See ERC20
  function balanceOf(address _owner) constant external returns (uint balance) {
    return balances[_owner];
  }

  // See ERC20
  function approve(address _spender, uint _value) external returns (bool success) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  // See ERC20
  function allowance(address _owner, address _spender) constant external returns (uint remaining) {
    return allowed[_owner][_spender];
  }

  //
  //  Migration methods
  //

  // See IncomingMigrationTokenInterface
  function incomingMigration(address _from, uint256 _value) external {
    if (!allowIncomingMigrations) throw;
    if (_value == 0) throw;
    totalSupply = safeAdd(totalSupply, _value);
    balances[_from] = safeAdd(balances[_from], _value);
    IncomingMigration(_from, _value);
  }

  // See OutgoingMigrationTokenInterface
  function changeMigrationMaster(address _master) onlyFromMigrationMaster external {
    if (_master == 0) throw;
    migrationMaster = _master;
  }

  // See OutgoingMigrationTokenInterface
  function setNewTokenAddress(address _newTokenAddress) onlyFromMigrationMaster external {
    if (newTokenAddress != 0) throw; // Ensure we haven't already set the new token
    if (_newTokenAddress == 0) throw;
    newTokenAddress = _newTokenAddress;
    allowOutgoingMigrationsUntil = (now + 26 weeks); // Only allow migrations for the next six months
  }

  // See OutgoingMigrationTokenInterface
  function outgoingMigration(uint256 _value) external {
    if (newTokenAddress == 0) throw; // Ensure that we have set the new token
    if (now > allowOutgoingMigrationsUntil) throw;
    if (_value == 0) throw;
    if (_value > balances[msg.sender]) throw;
    balances[msg.sender] = safeSub(balances[msg.sender], _value);
    totalSupply = safeSub(totalSupply, _value);
    totalMigrated = safeAdd(totalMigrated, _value);
    IncomingMigrationTokenInterface(newTokenAddress).incomingMigration(msg.sender, _value);
    OutgoingMigration(msg.sender, _value);
  }

  // Ends the possibility for any more tokens to be migrated from the old contract
  // to the new one
  function finalizeMigration() onlyFromMigrationMaster external {
    if (!allowIncomingMigrations) throw;
    allowIncomingMigrations = false;
    MigrationFinalized();
  }

}