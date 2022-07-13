require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // for Ganache GUI 
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider({
        providerOrUrl: `wss://rinkeby.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`,
        privateKeys: [ process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2 ]
      }),
      gas: 5000000, // gas limit
      gasPrice: 10000000000, // 10 gwei
      network_id: 4
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.7.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}