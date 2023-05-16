import CashToken from 'truffeBuild/CashToken.json';
import StrategyOneInterface from './StrategyOneInterface';
const Contract = require('web3-eth-contract');
Contract.setProvider('ws://localhost:7545');
const abi = CashToken.abi;
export const networkId = Object.entries(CashToken.networks)[0][0];
export const address = CashToken.networks[networkId].address;
const CashTokenContract = new Contract(abi, address);
console.log(CashTokenContract, CashTokenContract.methods)
console.log(Object.keys(CashTokenContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(CashTokenContract.methods).filter((val) => !val.includes('(')));

async function getBalanceOf(address) {
  const result = await CashTokenContract.methods.balanceOf(address).call()
  return result
}
function approve(beneficiary, amount, customer) {
  return CashTokenContract.methods.approve(beneficiary, amount).send({ from: customer, gas: 3000000 })
}

async function CashTokenBalanceUser(address) {
  return CashTokenContract.methods.balanceOf(address).call()
}

function chaeckAllowanceTo(address) {
  return CashTokenContract.methods.allowance(address, StrategyOneInterface.address).call()
}
async function checkAllowanceFrom(address) {
  return CashTokenContract.methods.allowance(CashTokenContract.address, address).call()
}

const CahTokenInterface = { getBalanceOf, approve, chaeckAllowanceTo, checkAllowanceFrom, CashTokenBalanceUser, address, networkId, }
export default CahTokenInterface