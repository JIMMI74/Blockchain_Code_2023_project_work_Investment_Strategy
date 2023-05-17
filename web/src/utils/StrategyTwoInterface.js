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


StrategyTwoInterface.buyAkkToken = (address, amount, duration) => {

  return StrategyTwoContract.methods.buyAkkToken(amount, duration).send({ from: address, gas: 3000000 });


}
StrategyOneInterface.withdrawAkkToken = (address, amount) => {
  return StrategyTwoContract.methods.withdrawAkkToken(amount).send({ from: address, gas: 3000000 });
}



export default StrategyTwoInterface;

