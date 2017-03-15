#!/bin/bash

# Creates the ROSCATest.sol contract (with members publicized)
# and runs the tests.
# Any commandline parameters are passed to "truffle test".

runCommand() {
  echo "### $@"
  $@ || { echo "*** Command '$@' failed, exiting" ; exit 1; }
}

runCommand truffle compile
runCommand truffle migrate --reset
runCommand truffle test $@
