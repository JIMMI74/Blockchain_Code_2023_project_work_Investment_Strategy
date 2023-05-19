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


/*

StrategyTwoInterface.buyAkkToken = async (address, amount, duration) => {
  try {
    return await StrategyTwoContract.methods.buyAkkToken(amount, duration).send({ from: address, gas: 3000000 });
  } catch (error) {
    console.error("Errore durante l'acquisto di AkkToken:", error);

    if (error.message.includes("Can not buy 0 AkkToken")) {
      // Mostra un messaggio di errore all'utente
      NotificationManager.error("Impossibile acquistare 0 AkkToken. Inserisci un importo valido.");
    } else if (error.message.includes("Not enough Cash Token")) {
      // Mostra un messaggio di errore all'utente
      NotificationManager.error("Non hai abbastanza Cash Token per completare l'acquisto.");
    } else if (error.message.includes("Amount too low")) {
      // Mostra un messaggio di errore all'utente
      NotificationManager.error("L'importo inserito è troppo basso. Inserisci un importo maggiore.");
    } else {
      // Gestisci altri errori o mostra un messaggio di errore generico
      NotificationManager.error("Si è verificato un errore durante l'acquisto di AkkToken. Riprova.");
    }

    // Rilancia l'errore in modo che possa essere gestito da eventuali chiamate esterne
    throw error;
  }
}

*/





StrategyTwoInterface.withdrawAkkToken = (address, amount) => {
  return StrategyTwoContract.methods.withdrawAkkToken(amount).send({ from: address, gas: 3000000 });
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

