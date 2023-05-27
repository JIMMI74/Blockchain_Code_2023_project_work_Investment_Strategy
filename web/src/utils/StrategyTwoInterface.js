import StrategyTwo from 'truffeBuild/StrategyTwo.json';
import { loadEnum } from 'spxd-web3-contract-enum'
import getMyAddress from './getMyAddres';
import { NotificationContainer, NotificationManager } from 'react-notifications';
const Contract = require('web3-eth-contract');


Contract.setProvider('ws://localhost:7545');
const abi = StrategyTwo.abi;
const networkId = Object.entries(StrategyTwo.networks)[0][0];
const address = StrategyTwo.networks[networkId].address;
export const StrategyTwoContract = new Contract(abi, address);
loadEnum(StrategyTwoContract, StrategyTwo.ast);
console.log(StrategyTwoContract.enums)
console.log(StrategyTwoContract)
console.log(Object.keys(StrategyTwoContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(StrategyTwoContract.methods).filter((val) => !val.includes('(')));

let StrategyTwoInterface = { ...StrategyTwoContract.enums }
StrategyTwoInterface.address = address

StrategyTwoInterface.getDurationByValue = (duration) => {
  return Object.entries(StrategyTwoContract.enums.AccumulationDuration).find((key, value) => value.toString() === duration.toString())[0]
  /*
  let risultato = '';
  Object.entries(StrategyTwoContract.enums.AccumulationDuration).forEach(([key, value]) => {
    if (value === duration)
      risultato = key
  });
  console.log(key_value[0], risultato)
  */
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

StrategyTwoInterface.rate = async () => {
  const result = await StrategyTwoContract.methods.rate().call();
  console.log(result)
  return result;
}
StrategyTwoInterface.MIN_AK_TOKEN_AMOUNT = () => {
  return StrategyTwoContract.methods.MIN_AK_TOKEN_AMOUNT().call();
}

StrategyTwoInterface.withdrawAkkToken = (address, amount) => {
  return StrategyTwoContract.methods.withdrawAkkToken(amount).send({ from: address, gas: 3000000 });
}
StrategyTwoInterface.calculateDuration = async (duration) => {
  return await StrategyTwoContract.methods.calculateDuration(duration).call()
}

StrategyTwoInterface.AkkTokenBought = () => {
  return StrategyTwoContract.events.AkkTokenBought();

}
StrategyTwoInterface.AkkTokenWithdrawn = () => {
  return StrategyTwoContract.events.AkkTokenWithdrawn();

}
StrategyTwoInterface.AkkTokenBalanceUpdated = () => {
  return StrategyTwoContract.events.AkkTokenBalanceUpdated();

}







export default StrategyTwoInterface;

