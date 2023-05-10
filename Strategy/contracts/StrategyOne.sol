// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CashToken.sol";
import "./Coupon.sol";
import "./IMintableToken.sol";


contract StrategyOne is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IMintableToken private coupon;
    IMintableToken public cashToken;

    enum StakeDuration { SHORT, MEDIUM, LONG } // custom chosen by user

    struct StakingData {
        uint256 amount;
        uint256 startStake;
        uint256 endStake;
        uint256 interestRate;
        uint256 duration;
        bool isCouponIssued;  
        
    }
    
    mapping(address => StakingData) public stakingData;

    mapping(address => bool) public whitelist; // tiene traccia degli utenti che hanno depositato

    event Staked(address indexed user, uint256 amount);
    event UnStaked(address indexed user, uint256 amount);
    event RewardRateChanged(uint256 newRate);
    event TopUp(uint256 amount);
    event Withdrawn(uint256 amount);
    event RewardReleased(uint256 amount);
    event CouponIssued(address indexed user, uint256 amount);
    event AddedToWhitelist(address indexed user);


    constructor(IMintableToken _coupon, IMintableToken _cashToken) {
        coupon = _coupon;
        cashToken = _cashToken;
    }

   

    function stake(uint256 _amount, StakeDuration _duration) public nonReentrant {
        require(_amount > 0, "Amount cannot be 0");
        require(cashToken.balanceOf(msg.sender) >= _amount, "Not enough tokens");
        

          // Add the user to the whitelist
        whitelist[msg.sender] = true;
        emit AddedToWhitelist(msg.sender);

         // Approva l'importo per il trasferimento dei cash token
        SafeERC20.safeIncreaseAllowance(cashToken, msg.sender, _amount);

        // Trasferisci i cash token dal wallet dell'utente al contratto

        SafeERC20.safeTransferFrom(cashToken, msg.sender, address(this), _amount);
          
        // Verifica se ci sono abbastanza coupon e minta se necessario
        //cashToken.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 balance = coupon.balanceOf(address(this));
        
        if(coupon.balanceOf(address(this)) <  _amount){
            coupon.mint(address(this), _amount - balance);    
        }
         // Trasferisci i coupon all'utente
        SafeERC20.safeTransfer(coupon, msg.sender, _amount);

        // Calcola il tasso di interesse e la durata
        uint256 interestRate = 0;
        uint256 duration;

        if (_duration == StakeDuration.SHORT) {  // 1 day
            interestRate = 2 ;
            duration = 24 hours;
        } else if (_duration == StakeDuration.MEDIUM) {  // 30 days
            interestRate = 5 ;
            duration = 30 days;
        } else if (_duration == StakeDuration.LONG) {  // 90 days
            interestRate = 10 ;
            duration = 90 days;
        } else {
            revert("Invalid stake duration");
        }

        stakingData[msg.sender] = StakingData({
            amount: _amount,
            startStake: block.timestamp,
            endStake: 0,
            interestRate: interestRate,
            duration: duration,
            isCouponIssued: false
        });

        emit Staked(msg.sender, _amount);
    }

    function hasStakedTokens(address _user) public view returns (bool) {
        return stakingData[_user].amount > 0;
    }

    function unstake() public nonReentrant {
        StakingData storage data = stakingData[msg.sender];
        require(data.amount > 0, "No staked tokens");
        require(block.timestamp >= data.startStake + data.duration, "Minimum stake period not reached");
        require(data.endStake == 0, "Already unstaked");
         // Calcola la ricompensa in cash token
        uint256 reward = (data.amount * data.interestRate * (block.timestamp - data.startStake)) / (100 * 86400);
        uint256 total = data.amount + reward;


     
        
         // Verifica se l'utente ha i coupon bloccati
        
        if(block.timestamp < data.startStake + data.duration){
        require(coupon.balanceOf(msg.sender) == 0, "Coupons locked until end of stake period");
        }

               // Restituisci i coupon se emessi
        if (data.isCouponIssued) {
            require(whitelist[msg.sender], "Sender not whitelisted");
            //coupon.burnFrom(reward, msg.sender);
            coupon.burnFrom(msg.sender, reward);
            data.isCouponIssued = false;
            coupon.burnFrom(address(this), reward);
            // Sottrai i token coupon bruciati dal bilancio dei coupon del contratto
            //uint256 balanceOfAddress= coupon.balanceOf(address(this));
            //unit256 balanceOfAddress= coupon.balanceOf(address(this));
           // balanceOfAddress = balanceOfAddress - coupon.balanceOf(address(this));
           
            //balanceOfAddress = balanceOfAddress - reward;
            
        }

          // Mint cashToken se non sufficiente disponibile
        uint256 balance = coupon.balanceOf(address(this));
        if (cashToken.balanceOf(address(this)) < total) {
            cashToken.mint(address(this), total - balance);
        }
        // Trasferisci l'importo totale (amount + reward) all'utente

        SafeERC20.safeTransfer(cashToken, msg.sender, total);

        data.amount = 0;
        data.startStake = 0;
        data.endStake = block.timestamp;
        data.interestRate = 0;
        data.duration = 0;
        whitelist[msg.sender] = false;
        data.isCouponIssued = false; 
        
        // Restituisci i coupon al contratto
       // SafeERC20.safeTransferFrom(coupon, msg.sender, address(this), total);

        //SafeERC20.safeTransfer(cashToken, msg.sender, total);
    
        //cashToken.safeTransfer(msg.sender, total);
    
        emit UnStaked(msg.sender, total);
    }

    function getCashTokenBalance() public view returns (uint256) { // restituisce il saldo dei cash token dell'utente
        return cashToken.balanceOf(msg.sender);
    }
    

    // get
    function getCouponBalance() public view returns (uint256) { // restituisce il saldo dei coupon dell'utente
        return coupon.balanceOf(msg.sender);
    }

    /*function getStakingData(address _user) public view returns (StakingData memory) { // restituisce i dati di staking dell'utente
        return stakingData[_user];
    }*/
    
    function getStakingDataAmount(address _user) public view returns (uint256) { // restituisce l'importo di staking dell'utente
        return stakingData[_user].amount;
    }
    function CouponAddress() public view returns (address) { // restituisce l'indirizzo del contratto coupon
        return address(coupon);
    }
    function CashTokenAddress() public view returns (address) {  // restituisce l'indirizzo del contratto cash token
        return address(cashToken);
    }
    function getUnstakeTime(address _user) public view returns (uint256) {  // restituisce il tempo di unstake dell'utente
        return stakingData[_user].startStake + stakingData[_user].duration;
    }
    function getInterestRate(address _user) public view returns (uint256) { //
        return stakingData[_user].interestRate;
    }
    function getDuration(address _user) public view returns (uint256) {
        return stakingData[_user].duration;
    }
    function getIsCouponIssued(address _user) public view returns (bool) {
        return stakingData[_user].isCouponIssued;
    }
    function totalRewards(address _user) public view returns (uint256) {
        StakingData memory data = stakingData[_user];
        return (data.amount * data.interestRate * (block.timestamp - data.startStake)) / (100 * 86400);
    }
    function totalStaked(address _user) public view returns (uint256) {
        StakingData memory data = stakingData[_user];
        return data.amount + totalRewards(_user);
    }
    function getBalance(address ContractAddress) public view returns (uint256 _amount) {
        return cashToken.balanceOf(ContractAddress);
    }
    function getOwner() public view returns (address) {
        return owner();
    }
    function getReward(address ContractAddress) public view returns (uint256 _amount) {
        return cashToken.balanceOf(ContractAddress);
    }
    function getStakingBalance(address ContractAddress) public view returns(uint256 _amount){
        return stakingData[ContractAddress].amount;
    }
    



}

