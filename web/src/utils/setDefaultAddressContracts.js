import { AkTokenContract } from "./AkTokenInterface";
import { CashTokenContract } from "./CashTokenInterface";
import { CouponContract } from "./CouponInterface";
import { StrategyOneContract } from "./StrategyOneInterface";
import { StrategyTwoContract } from "./StrategyTwoInterface";
import { USDTCashContract } from "./USDTCashInterface";

export default function (address) {
  StrategyOneContract.defaultAccount = address;
  CouponContract.defaultAccount = address;
  CashTokenContract.defaultAccount = address;

  StrategyTwoContract.defaultAccount = address;
  AkTokenContract.defaultAccount = address;
  USDTCashContract.defaultAccount = address;

}