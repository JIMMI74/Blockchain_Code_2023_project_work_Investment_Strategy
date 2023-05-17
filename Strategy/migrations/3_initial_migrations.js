const StrategyTwo = artifacts.require("StrategyTwo");
const USDTCash = artifacts.require("USDTCash");
const AkToken = artifacts.require("AkToken");

module.exports = async function (deployer, network, accounts) {

  await deployer.deploy(AkToken);
  const akToken = await AkToken.deployed();
  console.log("Deployed AkToken at address: ", akToken.address);

  await deployer.deploy(USDTCash);
  const usdtCash = await USDTCash.deployed();
  console.log("Deployed USDTCash at address: ", usdtCash.address);

  // Deploy StrategyTwo contract with USDTJ ,AkToken addresses as parameters
  await deployer.deploy(StrategyTwo, akToken.address, usdtCash.address, 5);
  const StrategyTwoContract = await StrategyTwo.deployed();
  console.log("Deployed StrategyTWO at address: ", StrategyTwoContract.address);

  // Transfer Ak Token => StrategyTwo contract
  const transferAkAmount = web3.utils.toBN('2200');
  await akToken.transfer(StrategyTwoContract.address, transferAkAmount);
  console.log(`Transferred ${transferAkAmount} Ak tokens to StrategyTWO contract`, StrategyTwoContract.address);

  const usdtCashAmount = web3.utils.toBN('33000000000000000000');
  await usdtCash.transfer(StrategyTwoContract.address, usdtCashAmount);
  console.log(`Transferred ${usdtCashAmount} USDT tokens to StrategyTWO contract`, StrategyTwoContract.address);


  // Transfer some tokens to accounts for testing purposes
  const trasferUsdtCashAmount = web3.utils.toBN('440000000000000000000');
  await usdtCash.transfer(accounts[1], trasferUsdtCashAmount);
  console.log(usdtCash.address, accounts[1], trasferUsdtCashAmount)

  // Transfer some tokens to accounts for testing purposes
  //const trasferAkkTokenAmount = web3.utils.toBN('123');
  //await akToken.transfer(accounts[1], trasferAkkTokenAmount);
  //console.log(akToken.address, accounts[1], trasferAkkTokenAmount)

  await usdtCash.transfer(accounts[2], trasferUsdtCashAmount);
  console.log(`Transferred ${trasferUsdtCashAmount} USDT tokens to account 2`);

  await usdtCash.transfer(accounts[3], '55000000000000');
  console.log(`Transferred 5000000000 USDT tokens to account 3`);

  //coupon.AddressStrategyOne(strategyOneContract.address)
  await akToken.transferOwnership(StrategyTwoContract.address)
  await usdtCash.transferOwnership(StrategyTwoContract.address)
  console.log('owner akToken is ' + await akToken.owner())
  console.log('owner usdtCash is ' + await usdtCash.owner())




}