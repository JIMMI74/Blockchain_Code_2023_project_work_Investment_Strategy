import Coupon from 'truffeBuild/Coupon.json';
//import { loadEnum } from 'spxd-web3-contract-enum'
const Contract = require('web3-eth-contract');

Contract.setProvider('ws://localhost:7545');
const abi = Coupon.abi;
const networkId = Object.entries(Coupon.networks)[0][0];
const address = Coupon.networks[networkId].address;
export const CouponContract = new Contract(abi, address);
//loadEnum(CouponContract, Coupon.ast);
//console.log(CouponContract.enums)
console.log(CouponContract)
console.log(Object.keys(CouponContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(CouponContract.methods).filter((val) => !val.includes('(')));

let CouponInterface = { ...CouponContract.enums }
CouponInterface.address = address

CouponInterface.approve = async (beneficiary, amount, customer) => {
  return CouponContract.methods.approve(beneficiary, amount).send({ from: customer, gas: 3000000 })
}


export default CouponInterface


