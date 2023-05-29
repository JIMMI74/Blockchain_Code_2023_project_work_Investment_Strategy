import React, { useState, useRef, useEffect } from "react";
import StrategyOneInterface from "../utils/StrategyOneInterface";
import CashTokenInterface, { networkId } from "../utils/CashTokenInterface";
import CouponInterface from "../utils/CouponInterface";
import setDefaultAddressContracts from "../utils/setDefaultAddressContracts";
import "react-notifications/lib/notifications.css";
import { NotificationContainer, NotificationManager } from 'react-notifications';



const styles = {

  container: {
    width: "auto",
    height: "100%",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#265980",
    padding: "20px",
    marginBottom: "100px",

  },

  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "2rem",
    marginBottom: "30px",
    // color: "#333",
    color: "#ECECEC"
  },
  formContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    minWidth: "500px",
    width: "fit-content",
    marginBottom: "50px",
  },
  stakeCard: {
    backgroundColor: "#eaf7f7",
  },
  unstakeCard: {
    backgroundColor: "#fbeff0",
  },
  cardTitle: {
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#555",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  formControl: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "2px solid #ccc",
  },
  select: {
    width: "100%",
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "2px solid #ccc",
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: "1rem",
    padding: "12px 24px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    transition: "0.3s",
  },
  stakeButton: {
    backgroundColor: "#2e8b57",
  },
  unstakeButton: {
    backgroundColor: "#ab0909",

  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  summary: {
    marginTop: "40px",
    color: "#555",
  },
  summaryTitle: {
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  coupon: {
    width: "20%",
    height: "auto",
    display: "flex",
    justifyContent: "left",
  },
  rate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",

  },
  time: {
    fontFamily: "Apple Braille',sans-serif",
    fontSize: "1.3rem",
    color: "black",
    marginLeft: "10px",

  },
  timemargin: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",

  },
  font: {
    fontSize: "1.3rem",
  }

};

export default function FormStake({ stakedData }) {
  //console.log('props STAKING', props)
  const [duration, setDuration] = useState("");
  const formRefStake = useRef(null);
  const fromRefUnstake = useRef(null);
  const [finalData, setFinalData] = useState({});
  const [remainingTimeFormatted, setRemainingTimeFormatted] = useState("");


  useEffect(() => {
    console.log('stakedData', stakedData);
    if (stakedData !== undefined) { // il calculate lo faccio subito la prima volta cosi ho i dati pronti
      calculateData(stakedData);

    }
    if (stakedData === undefined || stakedData.duration === '0') return;
    const timer = setInterval(() => { // ogni secondo aggiorno il timer del remaing time
      if (finalData.remainingTime !== undefined) {
        console.log("finalData start", finalData);
        console.log('timer in setInterval :', timer);
        const remaing = calculateData(stakedData);

        setRemainingTimeFormatted(remaing);
        //remaing.hasEnded = true;
        if (!remaing.negative) {
          clearInterval(timer);
          NotificationManager.info("Your stake has ended, Now you can unstake your tokens !");
          remaing.secconds = 0;
          remaing.minutes = 0;
          remaing.hours = 0;
          remaing.days = 0;
          remaing.negative = false;
          remaing.yars = 0;
          remaing.months = 0;
          remaing.hasEnded = false;
          remaing.hasStarted = false;
        }
      }
    }, 1000);
    console.log('timer', timer);

    return () => {
      clearInterval(timer);


    };
  }, [stakedData]);



  function calculateData(stakedData) {
    const { amount, duration, endStake, interestRate, isCouponIssued, startStake } = stakedData;
    const endDate = endStake !== '0' ? new Date(parseInt(endStake) * 1000) : 0;
    const startDate = startStake !== '0' ? new Date(parseInt(startStake) * 1000) : 0;

    const remainingTime = duration === "0" ? 0 : (new Date().getTime() / 1000) - ((parseInt(startStake) + parseInt(duration)));
    const durationDateParse = duration === "0" ? 0 : timeToDate(duration);
    const remainingTimeParse = timeToDate(remainingTime);
    const amountEth = window.web3.utils.fromWei(amount.toString(), 'ether');

    setFinalData({
      endDate,
      startDate,
      remainingTime,
      amountEth,
      duration,
      durationDateParse,
      interestRate,
      isCouponIssued
    });

    return remainingTimeParse;
  }


  function timeToDate(secconds) {

    if (secconds === 0)
      return { yars: 0, months: 0, days: 0, hours: 0, minutes: 0, secconds: 0, negative: false }

    const negative = secconds < 0;
    secconds = Math.abs(secconds);

    const yars = Math.floor(secconds / 31536000);
    secconds = secconds - (yars * 31536000);

    const months = Math.floor(secconds / 2592000);
    secconds = secconds - (months * 2592000);

    const days = Math.floor(secconds / 86400);
    secconds = secconds - (days * 86400);

    const hours = Math.floor(secconds / 3600);
    secconds = secconds - (hours * 3600);

    const minutes = Math.floor(secconds / 60);
    secconds = Math.floor(secconds - (minutes * 60));


    return { yars, months, days, hours, minutes, secconds, negative }
  }




  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const handleStake = async (event) => {
    event.preventDefault();

    const formData = new FormData(formRefStake.current);
    const amount = formData.get("amount");
    console.log({ formData, amount, formRefStake })
    if (!amount) {
      alert("You must enter an amount to move forward!");
      return;
    }
    if (!duration) {
      alert("In order to move forward you have to choose the duration!");
      return;
    }

    const amountEth = window.web3.utils.toWei(amount.toString(), 'ether')
    // Esegui qui la logica per piazzare lo stake con l'importo e la durata scelti
    console.log(`Stake di ${amountEth} CashToken per ${duration}`);
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("You must connect to MetaMask to move forward!");
      return;
    }
    setDefaultAddressContracts(accounts[0])
    console.log('approve stake', await CashTokenInterface.approve(StrategyOneInterface.address, amountEth, accounts[0]))
    console.log('stake', await StrategyOneInterface.stake(accounts[0], amountEth, duration).catch(handleError));
    function handleError(error) {
      if (error.message.includes("Already staked, please unstake first")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Already staked ! please unstake first.");
      } else if (error.message.includes("Amount cannot be 0")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("The amount must not be 0 !");
      } else if (error.message.includes("Not enough tokens")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Not enough tokens!");
      } else if (error.message.includes("Invalid stake duration")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Invalid stake duration");
      } else if (error.message.includes("No staked tokens")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("No staked tokens");
      } else if (error.message.includes("Minimum stake period not reached")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Minimum stake period not reached");
      } else if (error.message.includes("Already unstaked")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Already unstaked");
      } else if (error.message.includes("Insufficient coupon balance")) {
        // Mostra un messaggio di errore all'utente
        NotificationManager.error("Insufficient coupon balance");
      }
      else {
        // Gestisci altri errori o mostra un messaggio di errore generico
        NotificationManager.error("An error occurred, Please try again.");
      }
    }
    setDuration("")
    formRefStake.current.reset();

  };

  const handleUnstake = async (event) => {

    event.preventDefault();
    // Esegui qui la logica per piazzare lo stake con l'importo e la durata scelti
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("Per andare avanti devi connetterti a MetaMask!");
      return;
    }
    const staked = await StrategyOneInterface.stakingData(accounts[0]);
    const amount = staked.amount
    setDefaultAddressContracts(accounts[0])
    console.log('approve unstake', await CouponInterface.approve(StrategyOneInterface.address, amount, accounts[0]))
    console.log('unstake', await StrategyOneInterface.unstake(accounts[0]).catch(handleError));
    function handleError(error) {
      if (error.message.includes("No staked tokens")) {

        NotificationManager.error("There are no staked USDT !");
      } else if (error.message.includes("Minimum stake period not reached")) {

        NotificationManager.error("Minimum stake period not reached !");
      } else if (error.message.includes("Already unstaked")) {

        NotificationManager.error("Already unstaked !");
      } else if (error.message.includes("Insufficient coupon balance")) {

        NotificationManager.error("Insufficient coupon balance !");
      } else {

        NotificationManager.error("An error occurred, Please try again.");
      }
    }

    fromRefUnstake.current.reset();
  };
  return (

    <div style={styles.container}>
      <h2 style={styles.title}>Stake tokens to earn interest</h2>


      <div style={styles.formContainer}>
        <div style={{ ...styles.card, ...styles.stakeCard }}>
          <h3 style={styles.cardTitle}>Stake</h3>
          <form ref={formRefStake} style={styles.form}>
            <div style={styles.formControl}>
              <label htmlFor="amount">Please enter the stake amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="USDT"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formControl}>
              <label htmlFor="duration">Select the stake duration</label>
              <select
                id="duration"
                name="duration"
                value={duration}
                onChange={handleDurationChange}
                required
                style={styles.select}
              >
                <option value="">Please choose a duration</option>
                {Object.entries(StrategyOneInterface.StakeDuration).map(
                  ([key, value]) => {
                    return (
                      <option key={key} value={value}>
                        {key}
                      </option>
                    );
                  }
                )}
              </select>
            </div>
            <button
              onClick={handleStake}
              style={{ ...styles.button, ...styles.stakeButton }}
            >
              <h3>Stake</h3>
            </button>
            <table style={styles.rate} className="rate">
              <tbody>
                <tr>
                  <td></td>
                  <td><strong>Short</strong>: 2% 24H</td>
                </tr>
                <tr>
                  <td></td>
                  <td><strong>Medium</strong>: 5% 2 months</td>
                </tr>
                <tr>
                  <td></td>
                  <td><strong>Long</strong>: 10% 3months</td>
                </tr>
              </tbody>
            </table>

          </form>
        </div>

        <div style={{ ...styles.card, ...styles.unstakeCard }}>
          <h3 style={styles.cardTitle}>Unstake</h3>
          <form ref={fromRefUnstake} style={styles.form}>
            <div style={styles.formControl}>
              <label htmlFor="amount">Enter the amount of the unstake</label>
              <div style={{ display: "inline", margin: "40px" }}>
                <button
                  onClick={handleUnstake}
                  style={{ ...styles.button, ...styles.unstakeButton }}
                >
                  Widthdraw
                </button>
              </div>
            </div>
          </form>
          <div style={styles.summary}>
            <h4 style={styles.summaryTitle}>Transaction data</h4>
            <table style={styles.timemargin}>
              <tbody style={styles.font} >
                <tr style={styles.timemargin}>
                  <td><strong>EndDate:</strong></td>
                  <td style={styles.time}>
                    {remainingTimeFormatted.isNegative ? ":" : ""}
                    {remainingTimeFormatted.months} months, {remainingTimeFormatted.days} days, {remainingTimeFormatted.hours} hours, {remainingTimeFormatted.minutes} minutes, {remainingTimeFormatted.secconds} seconds
                  </td>
                </tr>
                <tr>
                  <td><strong>StartDate:</strong></td>
                  <td style={styles.time}>{finalData.startDate ? finalData.startDate.toLocaleString() : ""}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  );
};
