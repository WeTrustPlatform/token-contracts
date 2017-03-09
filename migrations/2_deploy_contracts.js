var Trustcoin = artifacts.require("./Trustcoin.sol");
var ExampleTrustcoin2 = artifacts.require("./ExampleTrustcoin2.sol");

module.exports = function(deployer) {
  deployer.deploy(Trustcoin);
  deployer.deploy(ExampleTrustcoin2);
};
