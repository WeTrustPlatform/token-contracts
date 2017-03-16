'use strict'

module.exports = {
  MAX_GAS_COST_PER_TX: 1e5 /* gas used per tx */ * 2e10, /* gas price */  // keep in sync with truffle.js
  ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
  NON_ZERO_ADDRESS: "0x0000000000000000000000000000000000000001",
  ONE_WEEK_IN_SECONDS: 60 * 60 * 24 * 7,
}
