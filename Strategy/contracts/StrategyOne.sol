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

    enum StakeDuration {
        SHORT,
        MEDIUM,
        LONG,
        DEV
    } // custom chosen by user;

    struct StakingData {
        uint256 amount;
        uint256 startStake;
        uint256 endStake;
        uint256 interestRate;
        uint256 duration;
        bool isCouponIssued;
    }
    StakingData details;

    function updateStakingData(StakingData memory _details) public {
        details = _details;
    }

    mapping(address => StakingData) public stakingData; // tiene tracccia degli address

    mapping(address => bool) public whitelist; // tiene traccia degli utenti che hanno depositato;

    event Staked(address indexed user, uint256 amount);
    event UnStaked(address indexed user, uint256 amount, uint256 reward);
    event RewardRateChanged(uint256 newRate);
    event RewardReleased(uint256 amount);
    event CouponIssued(address indexed user, uint256 amount);
    event AddedToWhitelist(address indexed user);

    //event BurnProcess(uint256 number);

    constructor(IMintableToken _coupon, IMintableToken _cashToken) {
        coupon = _coupon;
        cashToken = _cashToken;
    }

    // stake
    function stake(
        uint256 _amount,
        StakeDuration _duration
    ) public nonReentrant {
        StakingData storage data = stakingData[msg.sender];

        require(data.amount == 0, "Already staked, please unstake first.");
        require(_amount > 0, "Amount cannot be 0");
        require(
            cashToken.balanceOf(msg.sender) >= _amount,
            "Not enough tokens"
        );

        // Add the user to the whitelist
        whitelist[msg.sender] = true;
        emit AddedToWhitelist(msg.sender);

        // Approva l'importo per il trasferimento dei cash token
        SafeERC20.safeIncreaseAllowance(cashToken, msg.sender, _amount);

        // Trasferisci i cash token dal wallet dell'utente al contratto
        SafeERC20.safeTransferFrom(
            cashToken,
            msg.sender,
            address(this),
            _amount
        );

        // Verifica se ci sono abbastanza coupon e minta se necessario
        uint256 balance = coupon.balanceOf(address(this));

        // mint su StrategyOne
        if (coupon.balanceOf(address(this)) < _amount) {
            coupon.mint(address(this), _amount - balance);
        }
        // Trasferisci i coupon all'utente
        SafeERC20.safeTransfer(coupon, msg.sender, _amount);

        // Calcola il tasso di interesse e la durata
        uint256 interestRate = 0;
        uint256 duration;

        if (_duration == StakeDuration.SHORT) {
            // 1 day
            interestRate = 2;
            duration = 24 hours;
        } else if (_duration == StakeDuration.MEDIUM) {
            // 30 days
            interestRate = 5;
            duration = 30 days;
        } else if (_duration == StakeDuration.LONG) {
            // 90 days
            interestRate = 10;
            duration = 90 days;
            // Dev utilizzato per lo sviluppo
        } else if (_duration == StakeDuration.DEV) {
            // 1 second
            interestRate = 100;
            duration = 1 seconds;
        } else {
            revert("Invalid stake duration");
        }
        //reset valori
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

    // unstake

    function unstake() public nonReentrant {
        StakingData storage data = stakingData[msg.sender];
        require(data.amount > 0, "No staked tokens");
        require(
            block.timestamp >= data.startStake + data.duration,
            "Minimum stake period not reached"
        );
        require(data.endStake == 0, "Already unstaked");
        // Calcola la ricompensa in cash token in % ;
        uint256 reward = (data.amount * (data.interestRate / 100));
        uint256 total = data.amount + reward;

        // Controlla i coupon
        require(
            coupon.balanceOf(msg.sender) >= data.amount,
            "Insufficient coupon balance"
        );

        // Trasferisci i coupon dall'utente a StrategyOne;
        SafeERC20.safeTransferFrom(
            coupon,
            msg.sender,
            address(this),
            data.amount
        );

        // Brucia i coupon ricevuti dal contratto StrategyOne;
        coupon.burnFrom(address(this), data.amount);

        // Mint cashToken se non sufficiente disponibile;
        uint256 balance = data.amount;
        if (cashToken.balanceOf(address(this)) < total) {
            cashToken.mint(address(this), total - balance);
        }
        // Trasferisci l'importo totale (amount + reward) all'utente;
        SafeERC20.safeTransfer(cashToken, msg.sender, total);

        // Aggiorna i dati ;
        data.amount = 0;
        data.startStake = 0;
        data.endStake = block.timestamp;
        data.interestRate = 0;
        data.duration = 0;
        whitelist[msg.sender] = false;
        data.isCouponIssued = false;

        emit UnStaked(msg.sender, total, reward);
    }

    // se l'utente volesse avere info sulla sul reward
    function getTotalBalanceWithRewards(
        address _user
    ) public view returns (uint256) {
        StakingData storage data = stakingData[_user];
        uint256 reward = (data.amount * (data.interestRate / 100));
        uint256 total = data.amount + reward;
        uint256 cashTokenBalance = cashToken.balanceOf(_user);
        return cashTokenBalance + total;
    }

    function getCashTokenBalance() public view returns (uint256) {
        // restituisce il saldo dei cash token dell'utente
        return cashToken.balanceOf(msg.sender);
    }

    // get
    function getCouponBalanceUser() public view returns (uint256) {
        // restituisce il saldo dei coupon dell'utente
        return coupon.balanceOf(msg.sender);
    }

    function getStakingDataAmount(address _user) public view returns (uint256) {
        // restituisce l'importo di staking dell'utente
        return stakingData[_user].amount;
    }

    function CouponAddress() public view returns (address) {
        // restituisce l'indirizzo del contratto coupon
        return address(coupon);
    }

    function CashTokenAddress() public view returns (address) {
        // restituisce l'indirizzo del contratto cash token
        return address(cashToken);
    }

    function CashTokenBalanceUser(address _user) public view returns (uint256) {
        // restituisce il saldo dei cash token dell'utente     //ok usata
        return cashToken.balanceOf(_user);
    }

    function CouponBalanceUser(address _user) public view returns (uint256) {
        // restituisce il saldo dei coupon dell'utente
        return coupon.balanceOf(_user);
    }

    function CouponBalanceContract() public view returns (uint256) {
        // restituisce il saldo dei coupon del contratto
        return coupon.balanceOf(address(this));
    }



    function getBalanceCashToken(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        return cashToken.balanceOf(ContractAddress);
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    function getReward(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        return cashToken.balanceOf(ContractAddress);
    }

    function getStakingBalance(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        //restituisce l'importo di staking del contratto
        return stakingData[ContractAddress].amount; // ok usata
    }

    function getBalanceCoupon(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        return coupon.balanceOf(ContractAddress); // usata
    }

    function getCashTokenBalance(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        return cashToken.balanceOf(ContractAddress); // usata
    }
    
}
