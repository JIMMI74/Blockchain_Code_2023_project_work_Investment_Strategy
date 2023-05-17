import StrategyTwo from 'truffeBuild/StrategyTwo.json';
import { loadEnum } from 'spxd-web3-contract-enum'
const Contract = require('web3-eth-contract');

Contract.setProvider('ws://localhost:7545');
const abi = StrategyTwo.abi;
const networkId = Object.entries(StrategyTwo.networks)[0][0];
export const address = StrategyTwo.networks[networkId].address;
const StrategyTwoContract = new Contract(abi, address);
loadEnum(StrategyTwoContract, StrategyTwo.ast);
console.log(StrategyTwoContract.enums)
console.log(StrategyTwoContract)
console.log(Object.keys(StrategyTwoContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(StrategyTwoContract.methods).filter((val) => !val.includes('(')));

let StrategyTwoInterface = { ...StrategyTwoContract.enums }
StrategyTwoInterface.address = address

StrategyTwoInterface.debug = () => {
  return StrategyTwoContract.events.debug();

}
StrategyTwoInterface.getBalanceAkTokenStTwo = async (address) => {
  const result = await StrategyTwoContract.methods.getBalanceAkTokenStTwo(address).call();
  console.log('Balance Akktoken Address StrategyTwo', result)
  return result
}

StrategyTwoInterface.getUSDTBalanceStTwo = async (address) => {
  const result = await StrategyTwoContract.methods.getUSDTBalanceStTwo(address).call();
  console.log('Balance USDTCash Address StrategyTwo', result)
  return result
}
StrategyTwoInterface.getAkTokenBalanceUser = async () => {
  const result = await StrategyTwoContract.methods.getMyAkTokenBalanceUser().call()//send({ from: '0x89B8c0E7C948CCC50FC7dd085A3A4B5EA9f19264', gas: 3000000 });
  console.log('Balance Akktoken Address USER', result)
  return result;
}

StrategyTwoInterface.users = async (address) => {
  const result = await StrategyTwoContract.methods.users(address).call();
  console.log(result)
  return result;
}
StrategyTwoInterface.buyAkkToken = (address, amount, duration) => {

  return StrategyTwoContract.methods.buyAkkToken(amount, duration).send({ from: address, gas: 3000000 });
}

StrategyTwoInterface.withdrawAkkToken = (address, amount) => {
  return StrategyTwoContract.methods.withdrawAkkToken(amount).send({ from: address, gas: 3000000 });
}



export default StrategyTwoInterface;

