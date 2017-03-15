module.exports = function(deployer) {
  deployer.deploy(Trustcoin, web3.eth.accounts[0], {gas: 2400000});
  deployer.autolink();
  deployer.deploy(ExampleTrustcoin2, {gas: 2400000});
};
