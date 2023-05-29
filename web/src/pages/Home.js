import { NotificationContainer, NotificationManager } from 'react-notifications';
import CashTokenInterface from "../utils/CashTokenInterface";
import USDTCashInterface from "../utils/USDTCashInterface";
import StrategyTwoInterface from "../utils/StrategyTwoInterface";
import AkTokenInterface from "../utils/AkTokenInterface";
import StrategyOneInterface from "../utils/StrategyOneInterface";
import "react-notifications/lib/notifications.css";
import { Card, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import FormStake from "../form/FormStake";
import FormAcc from '../form/FormAcc';
import Web3 from "web3";
import React from "react";
import coupon from "../img/coupon.png";
import aktoken from "../img/aktoken.jpeg";
import pac from "../img/pac.png";

import "../App.css";
import setDefaultAddressContracts from '../utils/setDefaultAddressContracts';



const Home = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [stakedData, setStakedData] = useState();
  const [balanceCashToken, setBalanceCashToken] = useState(0);
  const [balanceCashTokenUser, setBalanceCashTokenUser] = useState(0);
  const [balanceCoupon, setBalanceCoupon] = useState(0);
  const [balanceCouponUser, setBalanceCouponUser] = useState(0);
  const [balanceAkTokenStTwo, setBalanceAkTokenStTwo] = useState(0)
  const [balanceUSTDStTwo, setBalanceUSDTStTwo] = useState(0)
  const [BalanceUserUSDT, setBalanceUserUSDT] = useState(0)
  const [BalanceUserAKToken, setBalanceUserAKToken] = useState(0)

  /* */
  const [users, setUsers] = useState();



  useEffect(() => {
    loadWeb3();
    //loadBlockchainData();
    if (account) reloadAllBalances();

    const eventStaked = StrategyOneInterface.Staked().on("data", (dati) => {
      console.log('Event Staked', { dati })
      const blockNumber = dati.blockNumber;
      const { user, amount } = dati.returnValues;
      console.log("user", user);
      if (user === account) {

        NotificationManager.success(
          "Complimenti !! Hai messo in Staking " +
          (window.web3.utils.fromWei(amount, "ether")) +
          " USDT. BN: " +
          blockNumber
        );
        reloadAllBalances();
      }
    })
    const eventUnStaked = StrategyOneInterface.UnStaked().on(
      "data",
      (dati) => {
        console.log(dati);
        const blockNumber = dati.blockNumber;
        const { user, amount, reward } = dati.returnValues;
        if (user === account) {
          NotificationManager.success(
            "Complimenti!! per il tuo staking hai ricevuto nel tuo wallet un totale di : " +
            (window.web3.utils.fromWei(amount, "ether")) + " USDT. " +
            "Interessi ricevuti dallo stake : " +
            (window.web3.utils.fromWei(reward, "ether")) + " USDT. " +
            "Transazione inserita nel BN: " +
            blockNumber
          );
          reloadAllBalances();
        }
      }
    );



    const eventAkkTokenBought = StrategyTwoInterface.AkkTokenBought().on("data", (dati) => {
      console.log('Event Buy', { dati })
      const blockNumber = dati.blockNumber;
      const { user, cashTokenAmount, akkTokenAmount, duration } = dati.returnValues;
      if (user === account) {
        // Verifica che usdtCashAmount e akkTokenAmount siano definiti
        if (cashTokenAmount !== undefined && akkTokenAmount !== undefined) {
          const akkTokenAmountInEth = window.web3.utils.fromWei(akkTokenAmount.toString(), "ether");
          const usdtCashAmountInEth = window.web3.utils.fromWei(cashTokenAmount.toString(), "ether");
          const durationString = StrategyTwoInterface.getDurationByValue(duration)


          NotificationManager.success(
            "L'operazione di acquisto di " + akkTokenAmountInEth + " AKKToken è andata a buon fine! Hai speso " + usdtCashAmountInEth + " USDT, sottoscrivendo un piano di versamenti per la durata di " + durationString + " giorni. La transazione è stata registrata sulla Blockchain al BN: " + blockNumber
          );
          reloadAllBalances();
        } else {
          console.error("usdtCashAmount o akkTokenAmount non definiti: ", cashTokenAmount, akkTokenAmount);
        }
      }
    });

    const eventAkkTokenWithdrawn = StrategyTwoInterface.AkkTokenWithdrawn().on("data", (dati) => {
      console.log('Event Withdraw', { dati })
      const blockNumber = dati.blockNumber;
      const { user, akkTokenAmount } = dati.returnValues;
      if (user === account) {

        if (akkTokenAmount !== undefined) {
          const akkTokenAmountInEth = window.web3.utils.fromWei(akkTokenAmount.toString(), "ether");
          NotificationManager.success(
            "L'operazione di prelievo di " + akkTokenAmountInEth + "AkToken è andata a buon fine! La transazione è stata registrata sulla Blockchain al BN: " + blockNumber
          );
          reloadAllBalances();
        } else {
          console.error("usdtCashAmount o akkTokenAmount non definiti: ", akkTokenAmount);
        }
      }
    });

    const eventAkkTokenBalanceUpdated = StrategyTwoInterface.AkkTokenBalanceUpdated().on("data", (dati) => {
      console.log('Event Remaining Token Balance', { dati })
      const { user, amount } = dati.returnValues;
      if (user === account) {

        if (amount !== undefined) {
          const BalanceInEth = window.web3.utils.fromWei(amount.toString(), "ether");
          NotificationManager.success(
            "Rimangono depositati nel tuo contratto:" + BalanceInEth + " AkToken"
          );
          reloadAllBalances();
        } else {
          console.error(" non definiti: ", amount);
        }
      }
    });


    return () => {
      eventStaked.unsubscribe(); // termina listener x nn farlo sovrapporre 
      eventUnStaked.unsubscribe();
      eventAkkTokenBought.unsubscribe();
      eventAkkTokenWithdrawn.unsubscribe();
      eventAkkTokenBalanceUpdated.unsubscribe();
    }

  }, [account]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.on("accountsChanged", (accounts) => {
        console.log("Gestione cambio account");
        handleAccountsChanged(accounts);
      });
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }

    loadBlockchainData();
  };


  async function loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    console.log("accounts", accounts);
    setAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    setLoading(false);
    const staked = await StrategyOneInterface.stakingData(accounts[0]);
    console.log({ staked });
    setStakedData(staked);
    const usersAcc = await StrategyTwoInterface.users(accounts[0]);
    console.log({ usersAcc });
    setUsers(usersAcc);
  }

  async function reloadAllBalances() {
    setDefaultAddressContracts(account);
    loadBalanceCashToken();
    LoadBalanceCashTokenUser();
    loadBalanceCoupon();
    LoadBalanceCouponReleasedUser();
    LoadBalanceAkTokenStTwo();
    LoadBalanceUSDTStTwo()
    LoadBalanceUserUSDTCash()
    LoadBalanceUserAkToken()
    setStakedData(await StrategyOneInterface.stakingData(account));
    setUsers(await StrategyTwoInterface.users(account));

  }
  async function handleAccountsChanged(accounts) {
    if (account === undefined) // prima volta 
      setAccount(accounts[0]);
    else
      window.location.reload();// refresh 
  };

  async function loadBalanceCashToken() {
    console.log(StrategyOneInterface.address);
    StrategyOneInterface.getCashTokenBalance(StrategyOneInterface.address)    //Address CashToken StratgeyOne
      .then((result) => {
        console.log('Cash Token Balance StrategyOne', { result })
        if (result !== undefined) setBalanceCashToken(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error("Cash Token Balance StrategyOne", { error });
      });
  }

  async function loadBalanceCoupon() {
    console.log(StrategyOneInterface.address);
    StrategyOneInterface.getBalanceCoupon(StrategyOneInterface.address)       //Address Coupon StratgeyOne
      .then((result) => {
        console.log('Balance Coupon StrategyOne', { result })
        if (result !== undefined) setBalanceCoupon(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error("Balance Coupon StrategyOne", { error });
      });
  }

  async function LoadBalanceCashTokenUser() {
    console.log(CashTokenInterface.address);                                //Address CashToken USER
    CashTokenInterface.CashTokenBalanceUser(account)
      .then((result) => {
        console.log('Balance User CashToken', { result })
        if (result !== undefined) setBalanceCashTokenUser(window.web3.utils.fromWei(result, "ether"));

      })

      .catch((error) => {
        console.error('Balance User CashToken', { error });
      });
  }
  async function LoadBalanceCouponReleasedUser() {
    StrategyOneInterface.getBalanceCoupon(account)    //Address Coupon USER
      .then((result) => {
        console.log('User Coupon Released StrategyOne', { result })
        if (result !== undefined) setBalanceCouponUser(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error('User Coupon Released StrategyOne', { error });
      });
  }
  async function LoadBalanceAkTokenStTwo() {
    console.log(StrategyTwoInterface.address, 'Address AkToken Contract StratgeyTwo');//Address AkToken Contract StratgeyTwo
    StrategyTwoInterface.getBalanceAkTokenStTwo(StrategyTwoInterface.address)
      .then((result) => {
        console.log('AkToken Contract StrategyTwo', { result })
        if (result !== undefined) setBalanceAkTokenStTwo(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error('AkToken Contract StrategyTwo', { error });
      });
  }
  async function LoadBalanceUSDTStTwo() {
    console.log(StrategyTwoInterface.address, 'Address USDT Contrcat StratgeyTwo');  // Addres USDT contract StratgeyTwo
    StrategyTwoInterface.getUSDTBalanceStTwo(StrategyTwoInterface.address)
      .then((result) => {
        console.log('USDT Cash Contract StrategyTwo', { result })
        if (result !== undefined) setBalanceUSDTStTwo(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error('USDT Cash Contract StrategyTwo', { error });
      });
  }
  async function LoadBalanceUserUSDTCash() {
    console.log(USDTCashInterface.address, 'Address USDTCash USER');
    USDTCashInterface.BalanceUserUSDTCash(account)
      .then((result) => {
        console.log('USER USDTCASH', { result })
        if (result !== undefined) setBalanceUserUSDT(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error('USDT Cash Contract StrategyTwo', { error });
      });
  }
  //getAkTokenBalanceUser
  async function LoadBalanceUserAkToken() {
    StrategyTwoInterface.getAkTokenBalanceUser()
      .then((result) => {
        console.log('USER AKToken', { result })
        if (result !== undefined) setBalanceUserAKToken(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error('USER AKToken', { error });
      });
  }

  return (
    <div className="main">
      <Navbar account={account} balanceCashTokenUser={balanceCashTokenUser.toLocaleString()} balanceCouponUser={balanceCouponUser.toLocaleString()} BalanceAkToken={BalanceUserAKToken.toLocaleString()} BalanceUSDTcash={BalanceUserUSDT.toLocaleString()} />
      <div className="container">
        <div class="wrapper">
          <div class="bg"> STAKE </div>
          <div class="fg"> STAKE </div>
        </div>
        <img src={coupon} alt="coupon" className="coupon" />
        <h1 className="titleCoupon">Coupon</h1>

        <FormStake stakedData={stakedData} />
      </div>
      <div className="insert">
        <div className="titlestewo">
          <h3 className="titletewo"> <span>Accumulation Plan Strategy</span> <span>Dollar Cost Averaging</span> <span>Theory</span></h3>
        </div>
        <img src={aktoken} alt="aktoken" className="aktoken" />
        <img src={pac} alt="pac" className="pac" />
        <h1 className="titleaktoken">AkToken</h1>

        <FormAcc users={users} />

      </div>

      <div className="dashboard border-primary">
        <div className="strategy-container">
          <h2 className="strategy-title">StrategyOne</h2>
          <div className="card-container">
            <Card className="dashboard-card one">
              <Card.Header className="card-label">STAKE CashToken/StrOne</Card.Header>
              <Card.Body>
                <Card.Text className="number">
                  {balanceCashToken.toLocaleString()} ETH
                </Card.Text>
              </Card.Body>
            </Card>
            <Card className="dashboard-card one">
              <Card.Header className="card-label">STAKE Coupon/StrOne</Card.Header>
              <Card.Body>
                <Card.Text className="number">
                  {balanceCoupon.toLocaleString()} ETH
                </Card.Text>
              </Card.Body>
            </Card>
            <Card className="dashboard-card one">
              <Card.Header className="card-label customer">STAKE CashToken</Card.Header>
              <Card.Body>
                <Card.Text className="number colorcustomer">
                  <strong>{balanceCashTokenUser.toLocaleString()} ETH</strong>
                </Card.Text>
              </Card.Body>
              Customer
            </Card>
            <Card className="dashboard-card one">
              <Card.Header className="card-label customer">STAKE Coupon</Card.Header>
              <Card.Body>
                <Card.Text className="number colorcustomer">
                  <strong>{balanceCouponUser.toLocaleString()} ETH</strong>
                </Card.Text>
              </Card.Body>
              Customer
            </Card>
          </div>
        </div>

        <div className="strategy-container">
          <h2 className="strategy-title">StrategyTwo</h2>
          <div className="card-container">
            <Card className="dashboard-card_second">
              <Card.Header className="card-label_second">ACC. AKToken/StrTwo</Card.Header>
              <Card.Body>
                <Card.Text className="number">
                  {balanceAkTokenStTwo.toLocaleString()} ETH
                </Card.Text>
              </Card.Body>
            </Card>
            <Card className="dashboard-card_second">
              <Card.Header className="card-label_second">ACC. USDT/StrTwo</Card.Header>
              <Card.Body>
                <Card.Text className="number">
                  {balanceUSTDStTwo.toLocaleString()} ETH
                </Card.Text>
              </Card.Body>
            </Card>
            <Card className="dashboard-card_second">
              <Card.Header className="card-label_second">ACC. USDT</Card.Header>
              <Card.Body>
                <Card.Text className="number colorcustomer">
                  <strong>{BalanceUserUSDT.toLocaleString()} ETH</strong>
                </Card.Text>
              </Card.Body>
              Customer
            </Card>
            <Card className="dashboard-card_second">
              <Card.Header className="card-label_second">ACC. AKToken</Card.Header>
              <Card.Body>
                <Card.Text className="number colorcustomer">
                  <strong>{BalanceUserAKToken.toLocaleString()} ETH</strong>
                </Card.Text>
              </Card.Body>
              Customer
            </Card>
          </div>
        </div>
      </div>


      <NotificationContainer />
    </div>


  );
};

export default Home;