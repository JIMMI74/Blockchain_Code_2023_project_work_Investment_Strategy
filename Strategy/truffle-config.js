 /**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */
 require('dotenv').config();

 const HDWalletProvider = require('@truffle/hdwallet-provider');
 

  
 require('@babel/register')
 require('babel-polyfill');
 module.exports = {
   /**
    * Networks define how you connect to your ethereum client and let you set the
    * defaults web3 uses to send transactions. If you don't specify one truffle
    * will spin up a development blockchain for you on port 9545 when you
    * run `develop` or `test`. You can ask a truffle command to use a specific
    * network from the command line, e.g
    *
    * $ truffle test --network <network-name>
    */
 
   networks: {
     ganache: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
    goerli: {
      provider: () => new HDWalletProvider([process.env.PRIVATE_KEY], `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`),
      network_id: 5,        
      gas: "4500000",
      gasPrice: "450000",
      gas: 4465030,
      gasPrice: 150000000000,
      confirmations: 10,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets )
      networkCheckTimeout: 10000000

    },
    alchemy: {
      provider: function () {
        return new HDWalletProvider([process.env.PRIVATE_KEY], `wss://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`
          
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 5,
      skipDryRun: true,
      confirmations: 10,
      networkCheckTimeout: 1000000,
      websocket: true,
      timeoutBlocks: 90000
    },
    
     mainnet: {
       network_id: 1,
       provider: () => new HDWalletProvider([process.env.PRIVATE_KEY], `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`),
       gas: 10000000,
       confirmations: 2,
     }
   },
 
   // Set default mocha options here, use special reporters etc.
   mocha: {
     // timeout: 100000
   },
 
    // Configure your compilers
   compilers: {
     solc: {
       version: "0.8.19",    // Fetch exact version from solc-bin (default: truffle's version)
       docker: false,        // Use "0.5.1" you've installed locally with docker (default: false)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
       }
     }
   },
   plugins: ['truffle-plugin-verify',  'truffle-contract-size'],
   api_keys: {
     etherscan: process.env.ETHERSCAN_API_KEY
   }
 };


















































































































