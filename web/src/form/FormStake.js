import React, { useState, useRef, useEffect } from "react";
import StrategyOneInterface from "../utils/StrategyOneInterface";
import CashTokenInterface from "../utils/CashTokenInterface";
import CouponInterface from "../utils/CouponInterface";
import setDefaultAddressContracts from "../utils/setDefaultAddressContracts";
import "react-notifications/lib/notifications.css";
import { NotificationContainer, NotificationManager } from 'react-notifications';

export default function FormStake({ stakedData }) {
  //console.log('props STAKING', props)
  const [duration, setDuration] = useState("");
  const formRefStake = useRef(null);
  const fromRefUnstake = useRef(null);
  const [finalData, setFinalData] = useState({});
  const [remainingTimeFormatted, setRemainingTimeFormatted] = useState("");


  useEffect(() => {
    if (stakedData) {
      calculateData(stakedData);
    }
  }, [stakedData]);


  useEffect(() => {
    const timer = setInterval(() => {
      if (finalData.remainingTime !== undefined) {
        console.log('finalData start', finalData);
        const remaing = calculateData(stakedData);
        if (!remaing.negative) {
          clearInterval(timer);
          remaing.secconds = 0;
          remaing.minutes = 0;
          remaing.hours = 0;
          remaing.days = 0;
          remaing.negative = false;
          remaing.years = 0;
          remaing.months = 0;
        }
        setRemainingTimeFormatted(remaing);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [finalData]);

  function calculateData(stakedData) {
    const { amount, duration, endStake, interestRate, isCouponIssued, startStake } = stakedData;
    const endDate = endStake !== '0' ? new Date(parseInt(endStake) * 1000) : 0;
    const startDate = startStake !== '0' ? new Date(parseInt(startStake) * 1000) : 0;

    const remainingTime = duration === "0" ? 0 : (new Date().getTime() / 1000) - ((parseInt(startStake) + parseInt(duration)));
    const durationDateParse = duration === "0" ? 0 : timeToDate(duration);
    const remainingTimeParse = timeToDate(remainingTime);
    const amountEth = window.web3.utils.fromWei(amount.toString(), 'ether');


    console.log({ durationDateParse, remainingTimeParse });
    console.log({ endDate, startDate, remainingTime, amountEth, duration, durationDateParse, interestRate, isCouponIssued });

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

    console.log('finalData end', remainingTime);

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
  /*function formatTime(time) {
    if (time === null) {
      return null;
    }
    const isNegative = time < 0;
    const absoluteTime = Math.abs(time);

    const days = Math.floor(absoluteTime / (24 * 60 * 60));
    const hours = Math.floor((absoluteTime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((absoluteTime % (60 * 60)) / 60);
    const seconds = Math.floor(absoluteTime % 60);

    return { days, hours, minutes, seconds, isNegative };
  } */


  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const handleStake = async (event) => {
    event.preventDefault();
    const formData = new FormData(formRefStake.current);
    const amount = formData.get("amount");
    console.log({ formData, amount, formRefStake })
    if (!amount) {
      alert("Per andare avanti devi inserire un importo!");
      return;
    }
    if (!duration) {
      alert("Per andare avanti devi scegliere la durata!");
      return;
    }

    const amountEth = window.web3.utils.toWei(amount.toString(), 'ether')
    // Esegui qui la logica per piazzare lo stake con l'importo e la durata scelti
    console.log(`Stake di ${amountEth} CashToken per ${duration}`);
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("Per andare avanti devi connetterti a MetaMask!");
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
      } else {
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

        NotificationManager.error("There are no staked CashTokens !");
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px",
    backgroundColor: "#f2f2f2",
    padding: "20px",
    borderRadius: "10px",
    height: "300px",
  };

  const inputStyle = {
    width: "80%",
    padding: "12px 20px",
    margin: "8px 0",
    boxSizing: "border-box",
    borderRadius: "5px",
    border: "2px solid #ccc",
  };



  return (
    <div style={{ width: 'auto', height: '10rem' }}>
      <h2>Stake tokens to earn interest</h2>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'lightblue', padding: '20px', borderRadius: '10px', margin: '20px' }}>
          <h3>Stake</h3>
          <form ref={formRefStake} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="amount">Inserisci l'importo dello stake:</label>
              <input type="number" id="amount" name="amount" placeholder="eth" required style={{ width: '200px', height: '30px', borderRadius: '5px', border: '1px solid grey', padding: '5px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="duration">Seleziona la durata dello stake:</label>
              <select id="duration" name="duration" value={duration} onChange={handleDurationChange} required style={{ width: '200px', height: '30px', borderRadius: '5px', border: '1px solid grey', padding: '5px' }}>
                <option value="">Scegli una durata</option>
                {Object.entries(StrategyOneInterface.StakeDuration).map(([key, value]) => {
                  return <option key={key} value={value}>{key}</option>
                })}
              </select>
            </div>
            <button onClick={handleStake} style={{ backgroundColor: 'green', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Stake</button>
          </form>
        </div>

        <div style={{ backgroundColor: 'lightcoral', padding: '20px', borderRadius: '10px', margin: '20px' }}>
          <h3>Unstake</h3>
          <form ref={fromRefUnstake} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="amount">Inserisci l'importo dello unstake:</label>
              <div style={{ display: 'inline', margin: '40px' }}>
                <button onClick={handleUnstake} style={{ backgroundColor: 'red', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Unstake</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div>
        <h2>Riepilogo dati:</h2>
        <table>
          <tbody>
            <tr>
              <td>EndDate:</td>
              <td>
                {remainingTimeFormatted.isNegative ? ':' : ''}
                {remainingTimeFormatted.months} months, {remainingTimeFormatted.days} days, {remainingTimeFormatted.hours} hours, {remainingTimeFormatted.minutes} minutes, {remainingTimeFormatted.secconds} seconds
              </td>
            </tr>
            <tr>
              <td>StartDate:</td>
              <td>{finalData.startDate ? finalData.startDate.toString() : ''}</td>
            </tr>
            {/* Aggiungi altre righe per gli altri valori che desideri visualizzare */}
          </tbody>
        </table>
      </div>
    </div>
  );
};




/*import React, { useState, useRef } from "react";
import StrategyOneInterface from "../utils/StrategyOneInterface";
import CashTokenInterface from "../utils/CashTokenInterface";
import CouponInterface from "../utils/CouponInterface";

export default function FormStake() {
  const [duration, setDuration] = useState("");
  const formRefStake = useRef(null);
  const fromRefUnstake = useRef(null);

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };

  const handleStake = async (event) => {
    event.preventDefault();
    const formData = new FormData(formRefStake.current);
    const amount = formData.get("amount");
    console.log({ formData, amount, formRefStake })
    if (!amount) {
      alert("Per andare avanti devi inserire un importo!");
      return;
    }
    if (!duration) {
      alert("Per andare avanti devi scegliere la durata!");
      return;
    }
    const amountEth = window.web3.utils.toWei(amount.toString(), 'ether')
    // Esegui qui la logica per piazzare lo stake con l'importo e la durata scelti
    console.log(`Stake di ${amountEth} CashToken per ${duration}`);
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("Per andare avanti devi connetterti a MetaMask!");
      return;
    }

    console.log('approve stake', await CashTokenInterface.approve(StrategyOneInterface.address, amountEth, accounts[0]))
    console.log('stake', await StrategyOneInterface.stake(accounts[0], amountEth, duration))
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
    console.log('approve unstake', await CouponInterface.approve(StrategyOneInterface.address, amount, accounts[0]))
    console.log('unstake', await StrategyOneInterface.unstake(accounts[0]))
  };
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px",
    backgroundColor: "#f2f2f2",
    padding: "20px",
    borderRadius: "10px",
    height: "300px",
  };

  const inputStyle = {
    width: "80%",
    padding: "12px 20px",
    margin: "8px 0",
    boxSizing: "border-box",
    borderRadius: "5px",
    border: "2px solid #ccc",
  };



  return (
    <div style={{ width: 'auto', height: '10rem' }}>
      <h2>Stake tokens to earn interest</h2>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'lightblue', padding: '20px', borderRadius: '10px', margin: '20px' }}>
          <h3>Stake</h3>
          <form ref={formRefStake} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="amount">Inserisci l'importo dello stake:</label>
              <input type="number" id="amount" name="amount" placeholder="eth" required style={{ width: '200px', height: '30px', borderRadius: '5px', border: '1px solid grey', padding: '5px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="duration">Seleziona la durata dello stake:</label>
              <select id="duration" name="duration" value={duration} onChange={handleDurationChange} required style={{ width: '200px', height: '30px', borderRadius: '5px', border: '1px solid grey', padding: '5px' }}>
                <option value="">Scegli una durata</option>
                {Object.entries(StrategyOneInterface.StakeDuration).map(([key, value]) => {
                  return <option key={key} value={value}>{key}</option>
                })}
              </select>
            </div>
            <button onClick={handleStake} style={{ backgroundColor: 'green', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Stake</button>
          </form>
        </div>

        <div style={{ backgroundColor: 'lightcoral', padding: '20px', borderRadius: '10px', margin: '20px' }}>
          <h3>Unstake</h3>
          <form ref={fromRefUnstake} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="amount">Inserisci l'importo dello unstake:</label>
              <div style={{ display: 'inline', margin: '40px' }}>
                <button onClick={handleUnstake} style={{ backgroundColor: 'red', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Unstake</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

*/