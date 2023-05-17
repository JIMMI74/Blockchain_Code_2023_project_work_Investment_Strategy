import AkToken from 'truffeBuild/AkToken.json';
import StrategyTwoInterface from './StrategyTwoInterface';
const Contract = require('web3-eth-contract');
Contract.setProvider('ws://localhost:7545');
const abi = AkToken.abi;
const networkId = Object.entries(AkToken.networks)[0][0];
export const address = AkToken.networks[networkId].address;
const AkTokenContract = new Contract(abi, address);
console.log(AkTokenContract, AkTokenContract.methods)
console.log(Object.keys(AkTokenContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(AkTokenContract.methods).filter((val) => !val.includes('(')));

let AkTokenInterface = { ...AkTokenContract.enums }
AkTokenInterface.address = address



AkTokenInterface.getBalanceOf = (address) => {
  const result = AkTokenContract.methods.balanceOf(address).call()
  console.log('Balance Address AKToken ')
  return result


}


AkTokenInterface.approve = async (beneficiary, amount, customer) => {
  const result = AkTokenContract.methods.approve(beneficiary, amount).send({ from: customer, gas: 3000000 })
  console.log('Approve AkToken ', result)
  return result


}

export default AkTokenInterface