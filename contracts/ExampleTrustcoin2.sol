/**
 *  Example 'New' Trustcoin contract, code based on multiple sources:
 *
 *  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/token/ERC20.sol
 *  https://github.com/golemfactory/golem-crowdfunding/tree/master/contracts
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/StandardToken.sol
 *  https://github.com/ConsenSys/Tokens/blob/master/Token_Contracts/contracts/HumanStandardToken.sol
 *
 *  Please note: outgoing migration support has been removed from this contract for readability purposes.
 *  Obviously it's best to design contracts with outgoing migrations in mind however
 */

pragma solidity ^0.4.8;

import './deps/ERC20TokenInterface.sol';
import './deps/SafeMath.sol';
import './Trustcoin.sol';

contract ExampleTrustcoin2 is IncomingMigrationTokenInterface, ERC20TokenInterface, SafeMath {

  string public constant name = 'Trustcoin2';
  uint8 public constant decimals = 18; // Same as ETH
  string public constant symbol = 'TRST2';
  string public constant version = 'TRST2.0';
  uint256 public totalSupply = 0; // Begins at 0, but increments as old tokens are migrated into this contract (ERC20)
  address public constant oldToken = 0; // @todo replace with real token address
  bool public allowIncomingMigrations = true; // Is set to false when we finalize migration
  uint256 public allowOutgoingMigrationsUntil; // Allows us to set a 'deadline' for migrating old tokens

  mapping (address => uint256) public balances; // (ERC20)
  mapping (address => mapping (address => uint256)) public allowed; // (ERC20)

  event IncomingMigrationFinalized();

  modifier onlyFromOldToken() {
    if (msg.sender != oldToken) throw;
    _;
  }

  function Trustcoin2(address _migrationMaster) {
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

  // See IncomingMigrationTokenInterface
  function incomingMigration(address _from, uint256 _value) onlyFromOldToken external {
    if (!allowIncomingMigrations) throw;
    if (_value == 0) throw;
    totalSupply = safeAdd(totalSupply, _value);
    balances[_from] = safeAdd(balances[_from], _value);
    IncomingMigration(_from, _value);
  }

  // Ends the possibility for any more tokens to be migrated from the old contract
  // to the new one. It's not strictly necessary to have our own flag for whether
  // migrations are permitted or not, but it helps the token contract be self-contained
  function finalizeIncomingMigration() onlyFromOldToken external {
    if (!allowIncomingMigrations) throw;
    allowIncomingMigrations = false;
    IncomingMigrationFinalized();
  }

}