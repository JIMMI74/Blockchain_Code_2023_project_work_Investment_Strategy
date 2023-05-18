// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IMintableToken.sol";
import "./USDTCash.sol";
import "./AkToken.sol";

contract StrategyTwo is Ownable, ReentrancyGuard {
    using SafeERC20 for USDTCash;
    using SafeERC20 for IERC20;

    IMintableToken public akkToken;
    USDTCash public usdtCash;
    uint256 public rate; // Tasso di conversione USDTCash/AkToken

    uint256 public constant MIN_CASH_TOKEN_AMOUNT = 0.1e18; // Quantità minima di Cash Token richiesta per l'acquisto di AkToken

    //tenere traccia del saldo dell'utente e dell'ultima volta che ha depositato
    struct User {
        uint256 balance;
        uint256 firstDepositTime;
        uint256 lastDepositTime;
        AccumulationDuration duration; // Durata del piano di accumulo (in secondi)
        
    }

    enum AccumulationDuration {
        DEV, // Durata di 10 secondi per il test dello sviluppatore
        FIVE_YEARS, // Durata di 5 anni
        TEN_YEARS, // Durata di 10 anni
        FIFTEEN_YEARS // Durata di 15 anni
    }

    mapping(address => User) public users; // Mapping degli utenti

 

    // Dichiarazione degli eventi per notificare le azioni eseguite dal contratto
    event AkkTokenBought(
        address indexed user,
        uint256 cashTokenAmount,
        uint256 akkTokenAmount,
        AccumulationDuration duration

    );
    event CashTokenWithdrawn(address indexed user, uint256 cashTokenAmount);
    event RateSet(uint256 rate);
    event AkkTokenWithdrawn(address indexed user, uint256 akkTokenAmount);
    event AddedToWhitelist(address indexed user);
    event AkkTokenBalanceUpdated(address indexed user, uint256 amount);
    event AkkTokenRemaining(uint256 amount);
    event debug(address add,uint256 amm);

    // Dichiarazione del costruttore per inizializzare le variabili di stato
    constructor(address _akkToken, address _usdtCash, uint256 _rate) {
        akkToken = IMintableToken(_akkToken);
        usdtCash = USDTCash(_usdtCash);
        rate = _rate;
    }
    function calculateDuration(AccumulationDuration _duration) public pure returns (uint256){
        if(_duration == AccumulationDuration.DEV){
            return 10;
        }else if(_duration == AccumulationDuration.FIVE_YEARS){
            return 60*60*24*365*5;
        }else if(_duration == AccumulationDuration.TEN_YEARS){
            return 60*60*24*365*10;
        }else if(_duration == AccumulationDuration.FIFTEEN_YEARS){
            return 60*60*24*365*15;
        }else{
            //require(false, "NO VALID DURATION");
            revert("NO VALID DURATION");
        }
    }
    function buyAkkToken(
        uint256 _amount, // akktoken
        AccumulationDuration _duration
    ) external nonReentrant {
        uint256 akkTokenAmount = _amount;
        //                     10    / 5   => 2
        uint256 usdtCashAmount = akkTokenAmount / rate;
        require(akkTokenAmount != 0, "Can not buy 0 AkkToken ");
        require(
            usdtCash.balanceOf(msg.sender) >= usdtCashAmount,
            "Not enough Cash Token"
        );

        require(usdtCashAmount >= MIN_CASH_TOKEN_AMOUNT, "Amount too low");
        require(
            _duration == AccumulationDuration.DEV ||
                _duration == AccumulationDuration.FIVE_YEARS ||
                _duration == AccumulationDuration.TEN_YEARS ||
                _duration == AccumulationDuration.FIFTEEN_YEARS,
            "Invalid duration"
        );

       

        // Approva l'importo per il trasferimento dei cash token
        SafeERC20.safeIncreaseAllowance(usdtCash, msg.sender, usdtCashAmount); /// fino a qua


        // contratto riceve tot cash contispondente al rate toke/ cash
        SafeERC20.safeTransferFrom(
            usdtCash,
            msg.sender,
            address(this),
            usdtCashAmount
        );

        // Verifica se ci sono abbastanza akkToken e minta se necessario
        uint256 balance = akkToken.balanceOf(address(this));
        if (balance < akkTokenAmount) {
            akkToken.mint(address(this), akkTokenAmount - balance);
        }

        SafeERC20.safeTransfer(akkToken, msg.sender, akkTokenAmount);

        // Aggiornamento del saldo dell'utente, dell'ultima volta che ha depositato e della durata del piano di accumulo
        // comprare multiple volte consecutive
        users[msg.sender].balance += akkTokenAmount;
        users[msg.sender].lastDepositTime = block.timestamp;

        if (users[msg.sender].firstDepositTime == 0) {
            // il primo deposito
            users[msg.sender].firstDepositTime == block.timestamp;
            users[msg.sender].duration = _duration;
        }

        // Emissione dell'evento AkkTokenBought per notificare l'acquisto di Akk Token da parte dell'utente
        emit AkkTokenBought(msg.sender, usdtCashAmount, akkTokenAmount, _duration);
    }

    // Metodo che consente all'owner di impostare il tasso di conversione USDTCash/AkToken
    function setRate(uint256 _rate) external onlyOwner {
        rate = _rate;

        // Emissione dell'evento RateSet per notificare l'aggiornamento del tasso di conversione
        emit RateSet(rate);
    }

    // Metodo che consente all'owner di ritirare gli Akk Token accumulati dal contratto
    function withdrawAkkToken(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(users[msg.sender].balance >= _amount, "Insufficient balance");
        uint256 akkTokenAmount = _amount;
        //                               20    / 5  => 4
        uint256 usdtCashAmount = akkTokenAmount / rate;
        //  35                                    30                 10
        if (block.timestamp <= (users[msg.sender].firstDepositTime +  calculateDuration(users[msg.sender].duration)))
            // true ergo la duration non e finita
            //             100                      1           => 99 >    50
            require( (users[msg.sender].balance - akkTokenAmount) > MIN_CASH_TOKEN_AMOUNT," Non puoi prelevere quanti token perche superara il limite prima del fine");

        users[msg.sender].balance -= akkTokenAmount;

        // Trasferisce la quantità di akkToken user => StrategyTwo
        // lato cliente approvazione di akktoken.approve(strategy.address,akktoken,account)
        SafeERC20.safeTransferFrom(
            akkToken,
            msg.sender,
            address(this),
            akkTokenAmount
        );

        // Brucia gli AkToken ricevuti dall'utente
        akkToken.burnFrom(address(this), akkTokenAmount);

        // Mint usdtCash se non sufficiente disponibile;
        uint256 balance = usdtCash.balanceOf(address(this));
        if (balance < usdtCashAmount) {
            usdtCash.mint(address(this), usdtCashAmount - balance);
        }

        // Trasferisci l'importo totale all'utente;
        SafeERC20.safeTransfer(usdtCash, msg.sender, usdtCashAmount);

        // Emissione dell'evento AkkTokenWithdrawn per notificare il prelievo degli Akk Token da parte dell'utente
        emit AkkTokenWithdrawn(msg.sender, akkTokenAmount);

        // Emissione dell'evento AkkTokenBalanceUpdated per notificare il saldo di AkToken rimanente per l'utente
        emit AkkTokenBalanceUpdated(msg.sender, users[msg.sender].balance);

        // Emissione dell'evento AkkTokenRemaining per notificare il saldo di AkToken rimanente all'interno del contratto StrategyTwo
        emit AkkTokenRemaining(akkToken.balanceOf(address(this)));
    }
    function getUSDTCashTokenBalance() public view returns (uint256) {
        // restituisce il saldo dei Usdt dell'utente
        return usdtCash.balanceOf(msg.sender);
    }

    
   
     function getMyAkTokenBalanceUser() public view returns (uint256 _amount) {
        // restituisce il saldo dei AkToken dell'utente
        //emit debug(msg.sender,akkToken.balanceOf(msg.sender));
        return akkToken.balanceOf(msg.sender);
    }
    
   function getBalanceAkTokenStTwo(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        return akkToken.balanceOf(ContractAddress); 
    }

    function getUSDTBalanceStTwo(
        address ContractAddress
    ) public view returns (uint256 _amount) {
        return usdtCash.balanceOf(ContractAddress); 
    }

    //function getAkTokenBalanceUser() public view returns (uint256 _amount) {
    //    return users[msg.sender].balance; 
   // }
}

// second Strategy