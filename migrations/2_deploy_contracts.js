module.exports = function(deployer) {
  deployer.then(function() {
    return Trustcoin.new(web3.eth.accounts[0], {gas: 2400000});
  }).then(function(trst) {
    return ExampleTrustcoin2.new(trst.address, {gas: 2400000});
  })
};
