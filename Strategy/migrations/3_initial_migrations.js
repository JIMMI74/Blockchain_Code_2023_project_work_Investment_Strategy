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

  const conversionRate = 2;

  console.log("Conversion rate set to: ", conversionRate);
  // Deploy StrategyTwo contract with USDTJ ,AkToken addresses as parameters
  await deployer.deploy(StrategyTwo, akToken.address, usdtCash.address, conversionRate);
  const StrategyTwoContract = await StrategyTwo.deployed();
  console.log("Deployed StrategyTWO at address: ", StrategyTwoContract.address);

  console.log({ accounts })
  //await akToken.mint(StrategyTwoContract.address, web3.utils.toBN('2000000000000000000'))

  //Test prova mint su account[4] account[5] account[6]
  await akToken.mint(accounts[4], web3.utils.toBN('123'))
  await akToken.mint(accounts[5], web3.utils.toBN('234'))
  await akToken.mint(accounts[6], web3.utils.toBN('345'))
  // transfer ownership 


  // STRATEGY TWO

  // Transfer Ak Token => StrategyTwo contract
  const transferAkAmount = web3.utils.toBN('140000000000000000000');
  await akToken.transfer(StrategyTwoContract.address, transferAkAmount);
  console.log(`from StrategyTwo Transferred ${transferAkAmount} Aktokens to  address :`, StrategyTwoContract.address);

  const usdtCashAmount = web3.utils.toBN('120000000000000000000');
  await usdtCash.transfer(StrategyTwoContract.address, usdtCashAmount);
  console.log(`from StrategyTwo Transferred ${usdtCashAmount} USDT tokens to address `, StrategyTwoContract.address);


  // ACCOUNTS

  // Transfer some tokens to accounts for testing purposes
  const TransferAmount_1 = web3.utils.toBN('100000000000000000000');
  await usdtCash.transfer(accounts[1], TransferAmount_1);
  console.log(usdtCash.address, accounts[1], TransferAmount_1)
  console.log(accounts[1], 'Account[1] CashTokne address is =', usdtCash.address, "Totale =", TransferAmount_1)
  console.log(` from account ${accounts[1]}Transferred ${TransferAmount_1} CashToken, address is:`, usdtCash.address);

  const TransferAmount_2 = web3.utils.toBN('5000000000000000000');
  await usdtCash.transfer(accounts[2], TransferAmount_2);
  console.log(accounts[2], 'Account[2] CashTokne address is =', usdtCash.address, "Totale =", TransferAmount_2)
  console.log(` from account ${accounts[2]}Transferred ${TransferAmount_2} CashToken, address is:`, usdtCash.address);

  const TransferAmount_3 = web3.utils.toBN('7000000000000000000');
  await usdtCash.transfer(accounts[3], TransferAmount_3);
  console.log(accounts[3], 'Account[3] CashTokne address is =', usdtCash.address, "Totale =", TransferAmount_3)
  console.log(` from account ${accounts[3]}Transferred ${TransferAmount_3} CashToken, address is:`, usdtCash.address);


  console.log('accounts[1] balance is ' + await usdtCash.balanceOf(accounts[1]))
  console.log('accounts[2] balance is ' + await usdtCash.balanceOf(accounts[2]))
  console.log('accounts[3] balance is ' + await usdtCash.balanceOf(accounts[3]))

  // Transfer ownership of AkToken and CashToken to StrategyTwo contract

  await akToken.transferOwnership(StrategyTwoContract.address)
  await usdtCash.transferOwnership(StrategyTwoContract.address)
  console.log('owner akToken is ' + await akToken.owner())
  console.log('owner usdtCash is ' + await usdtCash.owner())




}