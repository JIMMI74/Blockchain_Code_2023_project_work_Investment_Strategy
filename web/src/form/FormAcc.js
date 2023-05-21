
import React, { useState, useRef, useEffect } from "react";
import StrategyTwoInterface from "../utils/StrategyTwoInterface";
import USDTCashInterface from "../utils/USDTCashInterface";
import AkTokenInterface from "../utils/AkTokenInterface";
import setDefaultAddressContracts from "../utils/setDefaultAddressContracts";
import "react-notifications/lib/notifications.css";
import { NotificationContainer, NotificationManager } from 'react-notifications';



const buttonStyle = {
  backgroundColor: "#4CAF50",
  border: "none",
  color: "white",
  padding: "12px 24px",
  textAlign: "center",
  textDecoration: "none",
  display: "inline-block",
  fontSize: "16px",
  margin: "4px 2px",
  borderRadius: "5px",
  cursor: "pointer",
};

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridColumnGap: "20px",
  alignItems: "center",
  justifyContent: "center",
  margin: "20px",
  backgroundColor: "#f2f2f2",
  padding: "20px",
  borderRadius: "10px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 20px",
  margin: "8px 0",
  boxSizing: "border-box",
  borderRadius: "5px",
  border: "2px solid #ccc",
};

const labelStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "8px",
};

export default function FormAcc() {
  const [duration, setDuration] = useState("");
  const formRefBuy = useRef(null);
  const formRefWhitdraw = useRef(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [convesionRate, setConvesionRate] = useState(0);
  const [amountInCash, setAmountInCash] = useState(0);
  const [minAkTokenAmount, setMinAkTokenAmount] = useState(0);


  useEffect(() => {
    StrategyTwoInterface.rate().then(setConvesionRate)
    StrategyTwoInterface.MIN_AK_TOKEN_AMOUNT().then(amout => setMinAkTokenAmount(window.web3.utils.fromWei(amout, "ether")))
  })

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };
  const handleWithdrawAmountChange = (event) => {
    setWithdrawAmount(event.target.value);
  };




  const handleBuy = async (event) => {
    event.preventDefault();
    const formData = new FormData(formRefBuy.current);
    const amount = formData.get("amount");
    console.log({ formData, amount, formRefBuy })
    if (!amount) {
      alert("You must choose an amount to continue!");
      return;
    }
    if (!duration) {
      alert("To continue you must enter the duration of the plan!");
      return;
    }

    const amountEth = window.web3.utils.toWei(amount.toString(), 'ether')
    // Buy AkToken for Contract PLane
    console.log(`Accumulation plane di ${amountEth} UsdtCash per ${duration}`);
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("You must connect to MetaMask to move forward!");
      return;
    }

    setDefaultAddressContracts(accounts[0])

    console.log('approve Plane Contract', await USDTCashInterface.approve(StrategyTwoInterface.address, amountEth, accounts[0]).catch(handleError))
    console.log('Buy AkToken for Contract PLane', await StrategyTwoInterface.buyAkkToken(accounts[0], amountEth, duration).catch(handleError));

    function handleError(error) {
      if (error.message.includes("Can not buy 0 AkkToken")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Unable to purchase 0 AkkToken. Please enter a valid amount.");
      } else if (error.message.includes("Not enough Cash Token")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("You do not have enough Cash Token to complete the purchase.");
      } else if (error.message.includes("Amount too low")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Amount too low !  minimum deposit of 10 AkTokens is required to complete the transaction.");
      } else {
        // Gestisci altri errori o mostra un messaggio di errore generico
        NotificationManager.error("An error occurred while purchasing AkkToken. Please try again.");
      }
    }
    setWithdrawAmount("");
    setDuration("");
    formRefBuy.current.reset();
  };
  // withdraw con un amount specificato da utente
  const handleWhitdraw = async (event) => {
    event.preventDefault();
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("You must connect to MetaMask to move forward!");
      return;
    }
    // qui fai il controllo della quantita 
    if (!withdrawAmount) {
      alert("You must enter an amount to withdraw!");
      return;
    }

    const amountEth = window.web3.utils.toWei(withdrawAmount.toString(), 'ether')
    setDefaultAddressContracts(accounts[0])
    console.log('approve withdraw', await AkTokenInterface.approve(StrategyTwoInterface.address, amountEth, accounts[0]).catch(handleError))
    console.log('withdraw', await StrategyTwoInterface.withdrawAkkToken(accounts[0], amountEth).catch(handleError));
    function handleError(error) {
      //console.error(Object.entries(error))
      //NotificationManager.error("Si è verificato un errore : " + error.message.split(': ')[2]);
      if (error.message.includes("Amount must be greater than 0")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Enter an inmport greater than zero.");
      } else if (error.message.includes("Insufficient balance")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Bilancio Insufficiente.");
      } else if (error.message.includes("You cannot withdraw all the tokens, but you must leave 10 AkTokens until the end of the term of the accumulation plan")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("You cannot withdraw all the tokens, but you must leave 10 AkTokens until the end of the term of the accumulation plan.");
      } else {
        // Gestisci altri errori o mostra un messaggio di errore generico
        NotificationManager.error("An error occurred, Please try again.");
      }
    }
    setWithdrawAmount("");
    formRefWhitdraw.current.reset();
  };

  const handleConvertion = (e) => {
    const cashInEth = (e.target.value / convesionRate).toString()
    setAmountInCash(cashInEth);
  }


  return (
    <div style={{ width: "auto", height: "10rem" }}>
      <h2>Start accumulating AkToken using the dollar cost averaging strategy!</h2>
      <div style={formStyle}>
        <div>
          <h3>Buy AkToken</h3>
          <form ref={formRefBuy}>
            <label style={labelStyle} htmlFor="amount">
              Enter the deposit amount:
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder={`ETH min ${minAkTokenAmount} ETH`}
              required
              onChange={handleConvertion}
              style={inputStyle}
            />
            <h4>Amount in Cash: {amountInCash}</h4>
            <label style={labelStyle} htmlFor="duration">
              Select the duration of theplane:
            </label>
            <select
              id="duration"
              name="duration"
              value={duration}
              onChange={handleDurationChange}
              required
              style={inputStyle}
            >
              <option value="">Select Plane</option>
              {Object.entries(StrategyTwoInterface.AccumulationDuration).map(
                ([key, value]) => {
                  return (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  );
                }
              )}
            </select>
            <button onClick={handleBuy} style={buttonStyle}>
              Buy AkToken
            </button>
          </form>
        </div>

        <div>
          <h3>Withdraw</h3>
          <form ref={formRefWhitdraw}>
            <label style={labelStyle} htmlFor="withdrawAmount">
              Enter the amount you want to withdraw:
            </label>
            <input
              type="number"
              id="withdrawAmount"
              name="withdrawAmount"
              placeholder="ETH"
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange}
              required
              style={inputStyle}
            />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button onClick={handleWhitdraw} style={buttonStyle}>
                Withdraw
              </button>
            </div>
          </form>
        </div>
      </div>
      <NotificationContainer />
      <div>
      </div>
    </div>
  );
};


