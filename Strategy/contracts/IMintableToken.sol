// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IMintableToken is IERC20 {
    function mint(address to, uint256 amount) external;  
    function burnFrom(address account, uint256 amount) external;
}


// Path: contracts/StrategyOne.sol
// Compare this snippet from contracts/StrategyOne.sol:




    