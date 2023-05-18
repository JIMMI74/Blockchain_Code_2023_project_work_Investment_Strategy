import USDTCash from 'truffeBuild/USDTCash.json';
import StrategyOneInterface from './StrategyOneInterface';
const Contract = require('web3-eth-contract');
Contract.setProvider('ws://localhost:7545');
const abi = USDTCash.abi;
export const networkId = Object.entries(USDTCash.networks)[0][0];
export const address = USDTCash.networks[networkId].address;
export const USDTCashContract = new Contract(abi, address);
console.log(USDTCashContract, USDTCashContract.methods)
console.log(Object.keys(USDTCashContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(USDTCashContract.methods).filter((val) => !val.includes('(')));




function BalanceUserUSDTCash(address) {
  const result = USDTCashContract.methods.balanceOf(address).call()
  console.log(result, 'BalanceUser USDTCash')
  return result

}



function approve(beneficiary, amount, customer) {

  return USDTCashContract.methods.approve(beneficiary, amount).send({ from: customer, gas: 3000000 })

}
/*

function chaeckAllowanceTo(address) {
  return CashTokenContract.methods.allowance(address, StrategyOneInterface.address).call()
}
async function checkAllowanceFrom(address) {
  return CashTokenContract.methods.allowance(CashTokenContract.address, address).call()
}
*/

const USDTCashInterface = { BalanceUserUSDTCash, approve }
export default USDTCashInterface