'use strict'

// var Trustcoin = artifacts.require("./Trustcoin.sol")

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

  deployTrustcoin: function(owner, migrationMaster) {
    return Trustcoin.new(migrationMaster, {from: owner})
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
