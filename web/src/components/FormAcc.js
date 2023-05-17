import React, { useState, useRef } from "react";

export default function FormAcc() {
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
    return (
      <div>
        <form ref={formRefStake} onSubmit={handleStake}>
          <label> Importo: </label>
        </form>
      </div>
    );
  };
}

