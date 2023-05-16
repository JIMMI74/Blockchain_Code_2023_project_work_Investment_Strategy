import React, { useState, useRef } from "react";
import StrategyOneInterface from "../utils/StrategyOneInterface";
import CashTokenInterface from "../utils/CashTokenInterface";
import CouponInterface from "../utils/CouponInterface";

export default function Form() {
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

