const CashToken = artifacts.require("CashToken");
const Coupon = artifacts.require("Coupon");
//const AkToken = artifacts.require("AkToken");
//const USDTCash = artifacts.require("USDTCash");
const StrategyOne = artifacts.require("StrategyOne");
//const StrategyTwo = artifacts.require("StrategyTwo");

module.exports = async function (deployer, network, accounts) {

  // Deploy CashToken, Coupon and AkToken contracts
  await deployer.deploy(CashToken);
  const cashToken = await CashToken.deployed();
  console.log("Deployed CashToken at address: ", cashToken.address);

  await deployer.deploy(Coupon);
  const coupon = await Coupon.deployed();
  console.log("Deployed Coupon at address: ", coupon.address);


  // Deploy StrategyOne contract with Coupon and CashToken addresses as parameters
  await deployer.deploy(StrategyOne, coupon.address, cashToken.address);
  const strategyOneContract = await StrategyOne.deployed();
  console.log("Deployed StrategyOne at address: ", strategyOneContract.address);



  // Transfer some tokens to the StrategyOne contract
  const transferAmount = web3.utils.toBN('20000000000000000000');
  await coupon.transfer(strategyOneContract.address, transferAmount);
  console.log(`Transferred ${transferAmount} Coupon tokens to StrategyOne contract`);

  const cashTransferAmount = web3.utils.toBN('30000000000000000000');
  await cashToken.transfer(strategyOneContract.address, cashTransferAmount);
  console.log(`Transferred ${cashTransferAmount} CashToken tokens to StrategyOne contract`);

  // Transfer some tokens to accounts for testing purposes
  const testTransferAmount = web3.utils.toBN('400000000000000000000');
  await cashToken.transfer(accounts[1], testTransferAmount);
  console.log(cashToken.address, accounts[1], testTransferAmount)

  // console.log(`Transferred ${testTransferAmount} CashToken tokens to account 1`);


  await cashToken.transfer(accounts[2], testTransferAmount);
  console.log(`Transferred ${testTransferAmount} CashToken tokens to account 2`);

  await cashToken.transfer(accounts[3], '50000000000000');
  console.log(`Transferred 5000000000 CashToken tokens to account 3`);


  await coupon.transferOwnership(strategyOneContract.address)
  await cashToken.transferOwnership(strategyOneContract.address)
  console.log('owner coupon is ' + await coupon.owner())
  console.log('owner cashToken is ' + await cashToken.owner())



}














































