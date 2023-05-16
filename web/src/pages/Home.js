import { useEffect, useState } from "react";
import "../App.css";
import Navbar from "../components/Navbar";
import CashTokenInterface from "../utils/CashTokenInterface";
import USDTCashInterface from "../utils/USDTCashInterface";
import StrategyTwoInterface from "../utils/StrategyTwoInterface";
import AkTokenInterface from "../utils/AkTokenInterface";
import Web3 from "web3";
import React from "react";
import Form from "./Form";
import StrategyOneInterface from "../utils/StrategyOneInterface";
import "react-notifications/lib/notifications.css";
import { NotificationContainer, NotificationManager } from 'react-notifications';



const Home = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [balanceCashToken, setBalanceCashToken] = useState(0);
  const [balanceCashTokenUser, setBalanceCashTokenUser] = useState(0);
  const [balanceCoupon, setBalanceCoupon] = useState(0);
  const [balanceCouponUser, setBalanceCouponUser] = useState(0);

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
    const eventStaked = StrategyOneInterface.Staked().on("data", (dati) => {
      console.log('EVENT STAKED', { dati })
      const blockNumber = dati.blockNumber;
      const { user, amount } = dati.returnValues;
      console.log("user", user);
      if (user === account)

        NotificationManager.success(
          "Complimenti !! Hai messo in Staking " +
          (window.web3.utils.fromWei(amount, "ether")) +
          " CashToken. BN: " +
          blockNumber
        );
    })
    const eventUnStaked = StrategyOneInterface.UnStaked().on(
      "data",
      (dati) => {
        console.log(dati);
        const blockNumber = dati.blockNumber;
        const { user, amount, reward } = dati.returnValues;
        if (user === account)
          NotificationManager.success(
            "Complimenti!! per il tuo staking hai ricevuto " +
            (window.web3.utils.fromWei(amount, "ether")) +
            "+ gain derivanti dallo stake pari a CashToken " +
            (window.web3.utils.fromWei(reward, "ether")) +
            " ,vedi Transazione inserito nel BN: " +
            blockNumber
          );
      }
    );
    return () => {
      eventStaked.unsubscribe(); // termina listener x nn farlo sovrapporre 
      eventUnStaked.unsubscribe();
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      reloadAllBalances();
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
    console.log({ staked })
  }

  function reloadAllBalances() {
    loadBalanceCashToken();
    LoadBalanceCashTokenUser();
    loadBalanceCoupon();
    LoadBalanceCouponReleasedUser();

  }
  async function handleAccountsChanged(accounts) {
    if (account === undefined) // prima volta 
      setAccount(accounts[0]);
    else
      window.location.reload();// refresh 
  };

  async function loadBalanceCashToken() {
    console.log(StrategyOneInterface.address);
    StrategyOneInterface.getCashTokenBalance(StrategyOneInterface.address)
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
    StrategyOneInterface.getBalanceCoupon(StrategyOneInterface.address)
      .then((result) => {
        console.log('Balance Coupon StrategyOne', { result })
        if (result !== undefined) setBalanceCoupon(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error("Balance Coupon StrategyOne", { error });
      });
  }

  async function LoadBalanceCashTokenUser() {
    console.log(CashTokenInterface.address);
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
    StrategyOneInterface.getBalanceCoupon(account)
      .then((result) => {
        console.log('User Coupon Released StrategyOne', { result })
        if (result !== undefined) setBalanceCouponUser(window.web3.utils.fromWei(result, "ether"));
      })
      .catch((error) => {
        console.error('User Coupon Released StrategyOne', { error });
      });
  }

  return (
    <div className="main">
      <Navbar account={account} balanceCashTokenUser={balanceCashTokenUser.toLocaleString()}
        balanceCouponUser={balanceCouponUser.toLocaleString()}
      />
      <div className="container">
        <Form /> {/* Aggiunto il componente Form */}
      </div>
      <div className="insert">
        <span>
          <h2>qui dobbiamo fare il piano di accumulo</h2>
        </span>
        <div>
        </div>
      </div>
      {/* {logo}<a href="paginaperInserimentoDati">Registrati</a> */}
      <div className="Result">
        <div className="Div">
          <h3 className="Texture">
            StrategyOne CashToken Balance = {balanceCashToken.toLocaleString()}{" "}
            Eth
          </h3>
        </div>
      </div>
      <div className="Result">
        <div className="Div">
          <h3 className="Texture">
            StrategyOne Coupon Balance = {balanceCoupon.toLocaleString()}{" "}
            Eth
          </h3>
        </div>
      </div>
      <div className="Result">
        <div className="Div">
          <h3 className="Texture">
            CashToken accounts = {balanceCashTokenUser.toLocaleString()}{" "}
            Eth
          </h3>
        </div>
      </div>
      <div className="Result">
        <div className="Div">
          <h3 className="Texture">
            Coupon Released User = {balanceCouponUser.toLocaleString()}{" "}
            Eth
          </h3>
        </div>
      </div>
      < NotificationContainer />
    </div>



  );
};
export default Home;