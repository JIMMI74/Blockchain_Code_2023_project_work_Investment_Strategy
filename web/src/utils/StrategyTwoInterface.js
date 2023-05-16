import StrategyTwo from 'truffeBuild/StrategyTwo.json';
import { loadEnum } from 'spxd-web3-contract-enum'
const Contract = require('web3-eth-contract');

Contract.setProvider('ws://localhost:7545');
const abi = StrategyTwo.abi;
const networkId = Object.entries(StrategyTwo.networks)[0][0];
const address = StrategyTwo.networks[networkId].address;
const StrategyTwoContract = new Contract(abi, address);
loadEnum(StrategyTwoContract, StrategyTwo.ast);
console.log(StrategyTwoContract.enums)
console.log(StrategyTwoContract)
console.log(Object.keys(StrategyTwoContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(StrategyTwoContract.methods).filter((val) => !val.includes('(')));

let StrategyTwoInterface = { ...StrategyTwoContract.enums }
StrategyTwoInterface.address = address




export default StrategyTwoInterface;

