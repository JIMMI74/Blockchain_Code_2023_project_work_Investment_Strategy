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



  // STRATEGY ONE

  // Transfer some tokens to the StrategyOne contract
  const transferAmount = web3.utils.toBN('100000000000000000000');
  await coupon.transfer(strategyOneContract.address, transferAmount);
  console.log(`Transferred ${transferAmount} Coupon tokens to StrategyOne contract`);

  const cashTransferAmount = web3.utils.toBN('15000000000000000000');
  await cashToken.transfer(strategyOneContract.address, cashTransferAmount);
  console.log(`Transferred ${cashTransferAmount} CashToken tokens to StrategyOne contract`);





  //ACCOUNTS

  // Transfer some tokens to accounts for testing purposes
  const TransferAmount_1 = web3.utils.toBN('50000000000000000000');
  await cashToken.transfer(accounts[1], TransferAmount_1);
  console.log(accounts[1], 'Account[1] CashTokne address is =', cashToken.address, "Totale =", TransferAmount_1)
  console.log(` from account ${accounts[1]}Transferred ${TransferAmount_1} CashToken, address is:`, cashToken.address);



  const TransferAmount_2 = web3.utils.toBN('4000000000000000000');
  await cashToken.transfer(accounts[2], TransferAmount_2);
  //console.log(`Transferred ${testTransferAmount} CashToken tokens to account 2`);
  console.log(accounts[2], 'Account[2] CashTokne address is =', cashToken.address, "Totale =", TransferAmount_2)
  console.log(` from account ${accounts[2]}Transferred ${TransferAmount_2} CashToken, address is:`, cashToken.address);


  const TransferAmount_3 = web3.utils.toBN('3000000000000000000');
  await cashToken.transfer(accounts[3], TransferAmount_3);
  console.log(accounts[3], 'Account[3] CashTokne address is =', cashToken.address, "Totale =", TransferAmount_3)
  console.log(` from account ${accounts[3]}Transferred ${TransferAmount_3} CashToken, address is:`, cashToken.address);

  console.log(accounts, 'accounts Total')






  // Transfer ownership of the Coupon and CashToken contracts to the StrategyOne contract

  await coupon.transferOwnership(strategyOneContract.address)
  await cashToken.transferOwnership(strategyOneContract.address)
  console.log('owner coupon is ' + await coupon.owner())
  console.log('owner cashToken is ' + await cashToken.owner())



}














































