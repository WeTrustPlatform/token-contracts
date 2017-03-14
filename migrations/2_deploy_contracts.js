// below are not truffle 2 compatible
// var Trustcoin = artifacts.require("./Trustcoin.sol");
// var ExampleTrustcoin2 = artifacts.require("./ExampleTrustcoin2.sol");

module.exports = function(deployer) {
  deployer.deploy(Trustcoin, "0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1");
  deployer.deploy(ExampleTrustcoin2);
};
