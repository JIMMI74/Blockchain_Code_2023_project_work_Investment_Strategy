import StrategyOne from 'truffeBuild/StrategyOne.json';
import { loadEnum } from 'spxd-web3-contract-enum'
const Contract = require('web3-eth-contract');

Contract.setProvider('ws://localhost:7545');
const abi = StrategyOne.abi;
const networkId = Object.entries(StrategyOne.networks)[0][0];
const address = StrategyOne.networks[networkId].address;
const StrategyOneContract = new Contract(abi, address);
loadEnum(StrategyOneContract, StrategyOne.ast);
console.log(StrategyOneContract.enums)
console.log(StrategyOneContract)
console.log(Object.keys(StrategyOneContract.methods).filter((val) => val.includes('(')));
console.log(Object.keys(StrategyOneContract.methods).filter((val) => !val.includes('(')));

let StrategyOneInterface = { ...StrategyOneContract.enums }
StrategyOneInterface.address = address


StrategyOneInterface.stake = (address, amount, duration) => {
    return StrategyOneContract.methods.stake(amount, duration).send({ from: address, gas: 3000000 });

}



StrategyOneInterface.unstake = (address) => {
    return StrategyOneContract.methods.unstake().send({ from: address, gas: 3000000 });
}

StrategyOneInterface.stakingData = (address) => {
    return StrategyOneContract.methods.stakingData(address).call();
}


StrategyOneInterface.getStakingBalance = async (address) => {
    const result = StrategyOneContract.methods.getStakingBalance(address).call();
    console.log(result)
    return result;
}


StrategyOneInterface.getBalanceCoupon = async (address) => {
    const result = await StrategyOneContract.methods.getBalanceCoupon(address).call();

    console.log('Balance Coupon Address StrategyOne', result)
    return result;
}


StrategyOneInterface.getCashTokenBalance = async (address) => {
    const result = StrategyOneContract.methods.getCashTokenBalance(address).call();
    console.log('Balance CashToken Address StrategyOne', result)
    return result;
}

StrategyOneInterface.getCouponBalanceUser = async () => {
    const result = StrategyOneContract.methods.getCouponBalanceUser().call();
    console.log('Balance Coupon Address User', result)
    return result;
}





StrategyOneInterface.getTotalBalanceWithRewards = async (address) => {
    const result = StrategyOneContract.methods.getTotalBalanceWithRewards(address).call();
    return result;
}

StrategyOneInterface.Staked = () => {
    return StrategyOneContract.events.Staked();

}
StrategyOneInterface.UnStaked = () => {
    return StrategyOneContract.events.UnStaked();

}



export default StrategyOneInterface;
