
import React, { useState, useRef, useEffect } from "react";
import StrategyTwoInterface from "../utils/StrategyTwoInterface";
import USDTCashInterface from "../utils/USDTCashInterface";
import AkTokenInterface from "../utils/AkTokenInterface";
import setDefaultAddressContracts from "../utils/setDefaultAddressContracts";
import "react-notifications/lib/notifications.css";
import { NotificationContainer, NotificationManager } from 'react-notifications';

const styles = {
  container: {

    width: "100% ",
    height: "%",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "content-box",
    marginBottom: "80px",




  },
  title: {
    marginTop: "10px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "4rem",
    paddingBottom: "3rem",
    fontStyle: "italic",
  },
  formContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    height: "40vh",
    width: "50vw",


  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gridColumnGap: "20px",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px",
    backgroundColor: "#f2f2f2",
    padding: "20px",
    borderRadius: "10px",
    width: "40vw",


  },
  formSection: {
    marginBottom: "50px",


  },
  label: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "8px",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    padding: "12px 20px",
    margin: "8px 0",
    boxSizing: "border-box",
    borderRadius: "5px",
    border: "2px solid #ccc",

  },
  button: {
    backgroundColor: "#236624",
    borderColor: "10px ##030202",
    color: "white",
    padding: "12px 24px",
    textAlign: "left",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "30px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "140px",


  },
  note: {
    fontSize: "18px",
    fontStyle: "italic",
    marginBottom: "8px",
    color: "#613b1e",
  },
  durationText: {
    fontSize: "14px",
    marginTop: "20px",
    textAlign: "center",
  },
  conversion: {
    display: "flex",
    fontSize: "18px",
    color: "#613b1e",
    fontStyle: "italic",
  },
  buttonw: {

    backgroundColor: "#e3242d",
    color: "white",
    padding: "12px 24px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "10px 30px",
    borderRadius: "5px",
    cursor: "pointer",
    borderColor: "10px ##030202",

  },
  colorform: {
    backgroundColor: "#555c06",
    height: "auto",
    width: "50vw",
    marginTop: "20px",
    borderRadius: "10px",
  }

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
    <div style={styles.container}>
      <p style={styles.note}>
        <strong>(Dollar cost averaging Tehory)</strong>
      </p>
      <div style={styles.colorform}>
        <div style={styles.formContainer}>
          <form style={styles.form} ref={formRefBuy}>
            <div style={styles.formSection}>
              <h3>Buy AkToken</h3>
              <label style={styles.label} htmlFor="amount">
                Please enter the deposit amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder={`Minimum purchase ${minAkTokenAmount} AkToken`}
                required
                onChange={handleConvertion}
                style={styles.input}
              />
              <label style={styles.label} htmlFor="duration">
                Select investment plan:
              </label>
              <select
                id="duration"
                name="duration"
                value={duration}
                onChange={handleDurationChange}
                required
                style={styles.input}
              >
                <option value="">Duration </option>
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
              <button onClick={handleBuy} style={styles.button}>
                Buy AkToken
              </button>
            </div>
            <div style={styles.conversion}>
              <h3>Conversion rate AkToken/USDTCash: <strong><mark>{amountInCash}</mark></strong> </h3></div>
          </form>
          <form style={styles.form} ref={formRefWhitdraw}>
            <div style={styles.formSection}>

              <label style={styles.label} htmlFor="withdrawAmount">
                Enter the amount you wish to withdraw
              </label>
              <input
                type="number"
                id="withdrawAmount"
                name="withdrawAmount"
                placeholder="AkToken amount"
                value={withdrawAmount}
                onChange={handleWithdrawAmountChange}
                required
                style={styles.input}
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={handleWhitdraw} style={styles.buttonw}>
                  Sell AkToken
                </button>
              </div>
            </div>
            <h4>* You may not sell all the tokens purchased ,but you must leave until the agreed duration the amount corresponding to the first deposit</h4>
          </form>
        </div>
      </div>
      <p style={styles.durationText}>
        <strong>*You can choose a duration of 5, 10, or 15 years for the accumulation plan</strong>
      </p>
      <NotificationContainer />
    </div>
  );
};




