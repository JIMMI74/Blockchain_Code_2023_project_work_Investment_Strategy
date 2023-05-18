import React, { useState, useRef } from "react";
import StrategyTwoInterface from "../utils/StrategyTwoInterface";
import USDTCashInterface from "../utils/USDTCashInterface";
import AkTokenInterface from "../utils/AkTokenInterface";
import setDefaultAddressContracts from "../utils/setDefaultAddressContracts";


export default function FormAcc() {





  const [duration, setDuration] = useState("");
  const formRefBuy = useRef(null);
  const formRefWhitdraw = useRef(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");

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
      alert("Per andare avanti devi connetterti a MetaMask!");
      return;
    }
    setDefaultAddressContracts(accounts[0])
    console.log('approve Plane Contract', await USDTCashInterface.approve(StrategyTwoInterface.address, amountEth, accounts[0]))
    console.log('Buy AkToken for Contract PLane', await StrategyTwoInterface.buyAkkToken(accounts[0], amountEth, duration))
  };
  // withdraw con un amount specificato da utente
  const handleWhitdraw = async (event) => {
    event.preventDefault();
    const accounts = await window.web3.eth.getAccounts()
    if (accounts[0] === undefined) {
      alert("Per andare avanti devi connetterti a MetaMask!");
      return;
    }
    // qui fai il controllo della quantita 
    if (!withdrawAmount) {
      alert("You must enter an amount to withdraw!");
      return;
    }

    const amountEth = window.web3.utils.toWei(withdrawAmount.toString(), 'ether')
    setDefaultAddressContracts(accounts[0])
    console.log('approve withdraw', await AkTokenInterface.approve(StrategyTwoInterface.address, amountEth, accounts[0]))
    console.log('withdraw', await StrategyTwoInterface.withdrawAkkToken(accounts[0], amountEth).catch((error) => { console.error(error) }))
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
      <h2>Start accumulating  AkToken using the dollar coast averagin strategy !</h2>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'lightblue', padding: '20px', borderRadius: '10px', margin: '20px' }}>

          <h3>Buy AkToken</h3>
          <form ref={formRefBuy} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="amount">Enter the deposit amount:</label>
              <input type="number" id="amount" name="amount" placeholder="eth" required style={{ width: '200px', height: '30px', borderRadius: '5px', border: '1px solid grey', padding: '5px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="duration">Select the duration of the plane:</label>
              <select id="duration" name="duration" value={duration} onChange={handleDurationChange} required style={{ width: '200px', height: '30px', borderRadius: '5px', border: '1px solid grey', padding: '5px' }}>
                <option value="">Select Plane</option>
                {Object.entries(StrategyTwoInterface.AccumulationDuration).map(([key, value]) => {
                  return <option key={key} value={value}>{key}</option>
                })}
              </select>
            </div>
            <button onClick={handleBuy} style={{ backgroundColor: 'green', color: 'white', borderRadius: '5px', padding: '10px 20px', border: 'none', cursor: 'pointer' }}>Buy AkToken</button>
          </form>
        </div>

        <div style={{ backgroundColor: 'lightcoral', padding: '20px', borderRadius: '10px', margin: '20px' }}>
          <h3>Whitdraw</h3>
          <form ref={formRefWhitdraw} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="withdrawAmount">Enter the amount you want to withdraw:</label>
              <input type="number" id="withdrawAmount" name="withdrawAmount" placeholder="eth" value={withdrawAmount} onChange={handleWithdrawAmountChange} required style={inputStyle} />
            </div>
            <div style={{ display: 'inline', margin: '40px' }}>
              <button onClick={handleWhitdraw} style={buttonStyle}>Whitdraw</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};


// 138       140
//121   120
// 99          100
// 2           0