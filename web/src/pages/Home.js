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

import "../App.css";
import setDefaultAddressContracts from '../utils/setDefaultAddressContracts';



const Home = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [balanceCashToken, setBalanceCashToken] = useState(0);
  const [balanceCashTokenUser, setBalanceCashTokenUser] = useState(0);
  const [balanceCoupon, setBalanceCoupon] = useState(0);
  const [balanceCouponUser, setBalanceCouponUser] = useState(0);
  const [balanceAkTokenStTwo, setBalanceAkTokenStTwo] = useState(0)
  const [balanceUSTDStTwo, setBalanceUSDTStTwo] = useState(0)
  const [BalanceUserUSDT, setBalanceUserUSDT] = useState(0)
  const [BalanceUserAKToken, setBalanceUserAKToken] = useState(0)



  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
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
          " CashToken. BN: " +
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
            "Complimenti!! per il tuo staking hai ricevuto " +
            (window.web3.utils.fromWei(amount, "ether")) +
            "+ gain derivanti dallo stake pari a CashToken " +
            (window.web3.utils.fromWei(reward, "ether")) +
            " ,vedi Transazione inserito nel BN: " +
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
            "L'operazione di acquisto di " + akkTokenAmountInEth + " AKKToken è andata a buon fine! Hai speso " + usdtCashAmountInEth + " CashToken, sottoscrivendo un piano di versamenti per la durata di " + durationString + " giorni. La transazione è stata registrata sulla Blockchain al BN: " + blockNumber
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
            "Rimnagono depositati nel tuo contratto:" + BalanceInEth + " AkToken"
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
    const usersAcc = await StrategyTwoInterface.users(accounts[0]);
    console.log({ usersAcc });
  }

  function reloadAllBalances() {
    setDefaultAddressContracts(account);
    loadBalanceCashToken();
    LoadBalanceCashTokenUser();
    loadBalanceCoupon();
    LoadBalanceCouponReleasedUser();
    LoadBalanceAkTokenStTwo();
    LoadBalanceUSDTStTwo()
    LoadBalanceUserUSDTCash()
    LoadBalanceUserAkToken()

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
      <Navbar account={account} balanceCashTokenUser={balanceCashTokenUser.toLocaleString()} balanceCouponUser={balanceCouponUser.toLocaleString()} />
      <div className="container">
        <FormStake />
      </div>
      <div className="insert">
        <span>
          <h2>qui dobbiamo fare il piano di accumulo</h2>
        </span>
        <FormAcc />
        <div></div>
      </div>
      <Row className="dashboard">
        <Col className="dashboard-column">
          <Card className="dashboard-card one">
            <Card.Header className="card-label">STAKE CashToken/StrOne</Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {balanceCashToken.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="dashboard-column">
          <Card className="dashboard-card one">
            <Card.Header className="card-label">STAKE Coupon/StrOne</Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {balanceCoupon.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="dashboard-column">
          <Card className="dashboard-card one">
            <Card.Header className="card-label customer">STAKE CashToken/Customer</Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {balanceCashTokenUser.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="dashboard-column">
          <Card className="dashboard-card one">
            <Card.Header className="card-label customer">STAKE Coupon/Customer</Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {balanceCouponUser.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="dashboard">
        <Col className="dashboard-column">
          <Card className="dashboard-card_second">
            <Card.Header className="card-label_second">ACC. AKToken/StrTwo</Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {balanceAkTokenStTwo.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="dashboard">
        <Col className="dashboard-column">
          <Card className="dashboard-card_second">
            <Card.Header className="card-label_second">ACC. USDT/StrTwo</Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {balanceUSTDStTwo.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="dashboard">
        <Col className="dashboard-column">
          <Card className="dashboard-card_second">
            <Card.Header className="card-label_second">ACC. USDT/Customer </Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {BalanceUserUSDT.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="dashboard">
        <Col className="dashboard-column">
          <Card className="dashboard-card_second">
            <Card.Header className="card-label_second">ACC. AKToken/Customer </Card.Header>
            <Card.Body>
              <Card.Text className="number">
                {BalanceUserAKToken.toLocaleString()} ETH
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <NotificationContainer />
    </div>
  );
};

export default Home;