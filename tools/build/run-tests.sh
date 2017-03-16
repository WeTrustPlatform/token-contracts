#!/bin/bash

# Runs tests against Trustcoin.sol and ExampleTrustcoin2.sol
# Any commandline parameters are passed to "truffle test".

runCommand() {
  echo "### $@"
  $@ || { echo "*** Command '$@' failed, exiting" ; exit 1; }
}

runCommand truffle compile
runCommand truffle migrate --reset
runCommand truffle test $@
