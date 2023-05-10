const CashToken = artifacts.require("CashToken");
const Coupon = artifacts.require("Coupon");
const StrategyOne = artifacts.require("StrategyOne");
const { expect } = require('chai');
const { delay } = require('mocha-puppeteer');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('StrategyOne', ([owner, customer]) => {
  let coupon, cashToken, strategyOne, StakeDuration;

  function tokens(number) {
    return web3.utils.toWei(number.toString(), 'ether');
  }

  before(async () => {
    // Load Contracts
    cashToken = await CashToken.new({ from: owner });
    coupon = await Coupon.new({ from: owner });
    strategyOne = await StrategyOne.new(coupon.address, cashToken.address, { from: owner });
   StakeDuration = {
     SHORT : StrategyOne.StakeDuration.SHORT.toString(),
     MEDUIM : StrategyOne.StakeDuration.MEDIUM.toString(),
     LONG : StrategyOne.StakeDuration.LONG.toString(),
    },
    console.log({customer,owner})
    // Transfer 1000000 Coupon tokens to the strategyOne contract
    await coupon.transfer(strategyOne.address, tokens(1000000), { from: owner });

    // Transfer 100 CASH tokens to the customer account
    await cashToken.transfer(customer, tokens(100), { from: owner });
  });

  describe('CashToken Deployment', async () => {
    it('matches name successfully', async () => {
      const name = await cashToken.name();
      assert.equal(name, 'CashToken');
    });

    it('checks customer balance', async () => {
      const balance = await cashToken.balanceOf(customer);
      assert.isTrue(balance.gte(tokens(100)));
    });
  });

  describe('Coupon Deployment', async () => {
    it('matches name successfully', async () => {
      const name = await coupon.name();
      assert.equal(name, 'Coupon');
    });
  });

  describe('StrategyOne Deployment', async () => {
    it('deploys successfully', async () => {
      const address = await strategyOne.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it('cashToken address is correct', async () => {
      const cashTokenAddress = await strategyOne.cashToken();
      assert.equal(cashTokenAddress, cashToken.address);
    });
  });

  describe('Coupon Address Deployed', async () => {
    it('check transfer to strategyOne', async () => {
      const balance = await coupon.balanceOf(strategyOne.address);
      assert.equal(balance.toString(), tokens(1000000));
    });
  });

describe('Stake', async () => {

  it('should allow customer to stake', async () => {
    const amount = tokens(100);

    // Transfer 100 CASH tokens to the customer account
    //await cashToken.transfer(customer, tokens(100), { from: owner });

    // Approve the StrategyOne contract to spend the customer's CASH tokens
    await cashToken.approve(strategyOne.address, tokens(100), { from: customer });

    // Stake 100 CASH tokens for the SHORT duration
    await strategyOne.stake(tokens(100), StakeDuration.SHORT, { from: customer });

    // Check the customer's balance of CASH tokens after staking
    const balance = await cashToken.balanceOf(customer);
    assert.equal(balance.toString(), tokens(0));

    // Check the customer's balance of S1 tokens after staking
    const s1Balance = await strategyOne.getStakingBalance(customer);
    assert.equal(s1Balance.toString(), tokens(100));
  });
});
// OK
describe('Unstake', async () => {

it('should not allow customer to unstake more than their balance', function done() {
  this.timeout(10000); // Imposta un limite di tempo massimo di 10 secondi

   const amount = tokens(100);
  // Transfer 100 CASH tokens to the customer account
  cashToken.transfer(customer, tokens(100), { from: owner }).then(function() {
    // Approve the StrategyOne contract to spend the customer's CASH tokens
    return cashToken.approve(strategyOne.address, tokens(100), { from: customer });
  }).then(function() {
    // Stake 100 CASH tokens for the SHORT duration
    return strategyOne.stake(tokens(100), StakeDuration.SHORT, { from: customer });
  }).then(function() {
    // Wait for 24 hours before unstaking
    return new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  }).then(function() {
    // Try to unstake 200 CASH tokens from the SHORT duration
    return expectRevert(
      strategyOne.unstake(tokens(200), { from: customer }),
      'Insufficient balance'
    );
  }).then(function() {
    // Unstake 100 CASH tokens from the SHORT duration
    return strategyOne.unstake(tokens(100), { from: customer });
  }).then(function() {
    // Check the customer's balance of CASH tokens after unstaking
    return cashToken.balanceOf(customer);
  }).then(function(cashBalance) {
    assert.equal(cashBalance.toString(), tokens(100));
    // Check the customer's balance of S1 tokens after unstaking
    return strategyOne.getStakingBalance(customer);
  }).then(function(s1Balance) {
    assert.equal(s1Balance.toString(), tokens(0));
    done(); // Chiamata a done() per segnalare la fine del test
  }).catch(done); // Passa eventuali errori a done()
  });      
});

describe('Reward', async () => {

it('should allow customer to claim reward', function done() {
  this.timeout(10000); // Imposta un limite di tempo massimo di 10 secondi
    const amount = tokens(100);
  // Transfer 100 CASH tokens to the customer account
  cashToken.transfer(customer, tokens(100), { from: owner }).then(function() {
    return cashToken.increaseAllowance(strategyOne.address, tokens(100), { from: customer });
  }).then(function() {
    // Stake 100 CASH tokens for the SHORT duration
    return strategyOne.stake(tokens(100), StakeDuration.SHORT, { from: customer });
  }).then(function() {
    // Wait for 24 hours before claiming reward
    return new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
  }).then(function() {
    // Approve the StrategyOne contract to spend the reward tokens
    return coupon.approve(strategyOne.address, tokens(100), { from: owner });
  }).then(function() {
    // Claim reward
    return strategyOne.reward({ from: customer });
  }).then(function() {
    // Check the customer's balance of CASH tokens after claiming reward
    return cashToken.balanceOf(customer); 
  }).then(function(cashBalance) {
    assert.equal(cashBalance.toString(), tokens(102));
    // Check the customer's balance of S1 tokens after claiming reward
    return strategyOne.getStakingBalance(customer);
  }).then(function(s1Balance) {
    assert.equal(s1Balance.toString(), tokens(0));
    done(); // Chiamata a done() per segnalare la fine del test
  }).catch(done); // Passa eventuali errori a done()
  });
});

describe('BurnOut', async () => {
  it('should allow owner to burn out', function done() {
    this.timeout(10000); // Imposta un limite di tempo massimo di 10 secondi
      const amount = tokens(100);
    // Transfer 100 CASH tokens to the customer account
    cashToken.transfer(customer, tokens(100), { from: owner }).then(function() {
      return cashToken.increaseAllowance(strategyOne.address, tokens(100), { from: customer });
    }).then(function() {
      return strategyOne.stake(tokens(100), StakeDuration.SHORT, { from: customer });
    }).then(function() {
      // Wait for 24 hours before burning out
      return new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    } ).then(function() {
      return strategyOne.burnOut({ from: owner });
    }).then(function() {
      // Check the customer's balance of CASH tokens after burning out
      return cashToken.balanceOf(customer); 
    } ).then(function(cashBalance) {
      return assert.equal(cashBalance.toString(), tokens(100));
      // Check the customer's balance of S1 tokens after burning out
    } ).then(function(s1Balance) {
      return strategyOne.getStakingBalance(customer);
    } ).then(function(s1Balance) {
      return assert.equal(s1Balance.toString(), tokens(0));
      done(); // Chiamata a done() per segnalare la fine del test
    } ).catch(done); // Passa eventuali errori a done()
    });
  });
  describe('InterestRate', async () => {
  it('should allow owner to change interest rate', function done() {
    this.timeout(10000); // Imposta un limite di tempo massimo di 10 secondi
      const amount = tokens(100);
    // Transfer 100 CASH tokens to the customer account
    cashToken.transfer(customer, tokens(100), { from: owner }).then(function() {
      return cashToken.increaseAllowance(strategyOne.address, tokens(100), { from: customer });
    }).then(function() {
      return strategyOne.stake(tokens(100), StakeDuration.SHORT, { from: customer });
    } ).then(function() {
      return new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    } ).then(function() {
      return strategyOne.reward({ from: customer });
    } ).then(function() {
      // Check the customer's balance of CASH tokens after claiming reward
      return cashToken.balanceOf(customer);
    } ).then(function(cashBalance) {
      return assert.equal(cashBalance.toString(), tokens(102));
      // Check the customer's balance of S1 tokens after claiming reward
    }
    ).then(function(s1Balance) {
      return strategyOne.getStakingBalance(customer);
    }
    ).then(function(s1Balance) {
      return assert.equal(s1Balance.toString(), tokens(0));
      done(); // Chiamata a done() per segnalare la fine del test
    }
    ).catch(done); // Passa eventuali errori a done()
    });
  });

  describe('OnlyOwner StrategyOne Deployment', async () => {
    it('verify who is OnlyOwner StrategyOne Deployment', async () => {
      const onlyOwner = await strategyOne.owner();
      assert.equal(onlyOwner, owner);
    } );
  });

  
});










