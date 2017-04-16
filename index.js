let fs = require('fs');
let solc = require('solc');
let co = require('co').wrap
let path = require('path')

let trustcoinSourcePath = path.join(__dirname, '../../contracts/Trustcoin.sol')
let trustcoinDepPath = path.join(__dirname, '../../contracts/deps/ERC20TokenInterface.sol')

const SOLC_VERSION = 'v0.4.8+commit.60cc1668'

function getContractContents(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  return content;
}

function compileSource (input, callback) {
  solc.loadRemoteVersion(SOLC_VERSION, function(e, correctSolc) {
    if (e) {
      throw new Error('Could not load correct solc version', e)
    }
    let output = correctSolc.compile({sources: input}, 1)
    callback(null, output)
  })
}

let main = co(function*() {
  let compilerInput = {
    'Trustcoin.sol': getContractContents(trustcoinSourcePath),
    'deps/ERC20TokenInterface.sol': getContractContents(trustcoinDepPath)
  }

  let compiledOutput = yield new Promise((resolve, reject) => {
    compileSource(compilerInput, (e, output) => {
      if (e) {
        reject(e)
        return
      }
      resolve(output)
    })
  })
  let contractOutput = compiledOutput.contracts.Trustcoin
  let trustcoinContractAbi = JSON.parse(contractOutput.interface);
  return {abi: trustcoinContractAbi, bytecode: contractOutput.bytecode};
})

module.exports = main
