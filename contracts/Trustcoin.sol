/**
 *  Trustcoin contract, code based on multiple sources:
 *
 *  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20.sol
 *  https://github.com/golemfactory/golem-crowdfunding/tree/master/contracts
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/HumanStandardToken.sol
 */

pragma solidity ^0.4.8;

import './deps/ERC20TokenInterface.sol';
import './deps/SafeMath.sol';
import './deps/MigratableTokenInterface.sol';
import './deps/MigratedTokenInterface.sol';

contract Trustcoin is MigratableTokenInterface, ERC20TokenInterface, SafeMath {

  string public constant name = 'Trustcoin';
  uint8 public constant decimals = 18; // Same as ETH
  string public constant symbol = 'TRST';
  string public constant version = 'TRST1.0';
  uint256 public totalSupply = 100000000; // One hundred million (ERC20)
  uint256 public totalMigrated; // Begins at 0 and increments as tokens are migrated to a new contract
  address public newTokenAddress; // Address of the new token contract
  uint256 public allowOutgoingMigrationsUntil;

  mapping(address => uint256) public balances; // (ERC20)
  mapping (address => mapping (address => uint256)) public allowed; // (ERC20)

  address public migrationMaster;

  function Trustcoin(address _migrationMaster) {
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

  // See MigratableTokenInterface
  function changeMigrationMaster(address _master) external {
    if (_master == 0) throw;
    migrationMaster = _master;
  }
  
  // See MigratableTokenInterface
  function setNewTokenAddress(address _newTokenAddress) external {
    if (newTokenAddress != 0) throw; // Ensure we haven't already set the new token
    if (_newTokenAddress == 0) throw;
    newTokenAddress = _newTokenAddress;
    allowOutgoingMigrationsUntil = (now + 26 weeks); // Only allow migrations for the next six months
  }

  // See MigratableTokenInterface
  function discardTokens(uint256 _value) external {
    if (newTokenAddress == 0) throw; // Ensure that we have set the new token
    if (now < allowOutgoingMigrationsUntil) throw;
    if (_value == 0) throw;
    if (_value > balances[msg.sender]) throw;
    balances[msg.sender] = safeSub(balances[msg.sender], _value);
    totalSupply = safeSub(totalSupply, _value);
    totalMigrated = safeAdd(totalMigrated, _value);
    MigratedTokenInterface(newTokenAddress).migrateOldTokens(msg.sender, _value);
    OutgoingMigration(msg.sender, _value);
  }

}