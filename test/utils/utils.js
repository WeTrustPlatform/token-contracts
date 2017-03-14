'use strict'

var Trustcoin = artifacts.require("./Trustcoin.sol")
var ExampleTrustcoin2 = artifacts.require("./ExampleTrustcoin2.sol")

let assert = require('chai').assert
let consts = require("./consts.js")
let Promise = require("bluebird")

// we need this becaues test env is different than script env
let myWeb3 = (typeof web3 === undefined ? undefined : web3)

module.exports = {
  setWeb3: function(web3) {
    myWeb3 = web3
  },

  assertEqualUpToGasCosts: function(actual, expected) {
    assert.closeTo(actual, expected, consts.MAX_GAS_COST_PER_TX)
  },

  assertThrows: function(promise, err) {
    return promise.then(function() {
      assert.isNotOk(true, err)
    }).catch(function(e) {
      assert.include(e.message, 'invalid JUMP', "Invalid Jump error didn't occur")
    })
  },

  assertDoesNotThrow: function(promise, err) {
    return promise.then(function() {
      assert.isNotOk(true, err)
    }).catch(function(e) {
      assert.notInclude(e.message, 'invalid JUMP', "Invalid Jump error occurred")
    })
  },

  deployTrustcoin: function(owner, migrationMaster) {
    return Trustcoin.new(migrationMaster, {from: owner})
  },

  deployExampleTrustcoin2: function(owner) {
    return ExampleTrustcoin2.new({from: owner})
  },

  increaseTime: function(bySeconds) {
    myWeb3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [bySeconds],
      id: new Date().getTime(),
    });
  },

  getGasUsage: function(transactionPromise, extraData) {
    return new Promise(function(resolve, reject) {
      transactionPromise.then(function(txId) {
        resolve({
          gasUsed: myWeb3.eth.getTransactionReceipt(txId).gasUsed,
          extraData: extraData,
        })
      }).catch(function(reason) {
        reject(reason);
      })
    })
  }
};
