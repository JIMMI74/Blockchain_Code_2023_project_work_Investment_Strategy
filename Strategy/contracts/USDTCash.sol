// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract USDTCash is ERC20, Ownable {
    event Mint(address indexed to, uint256 amount);

    constructor() ERC20("USDTCash", "USC") {
        _mint(address(this), 50000000000000 * 10 ** decimals());
        _mint(owner(), 50000000000000 * 10 ** decimals());
    }

    function mint(address account, uint256 amount) public onlyOwner {
        require(account != address(0), "Invalid address"); // funzionlita' accessoria se desidero che il token sia mintabile solo da un indirizzo specifico futuro
        require(amount > 0, "Amount cannot be 0");
        _mint(account, amount);
        emit Mint(account, amount);
    }

    function checkBalance() public view returns (bool) {
        uint256 totalSupply = totalSupply();
        uint256 contractBalance = balanceOf(address(this));
        uint256 ownerBalance = balanceOf(owner());
        return totalSupply == (contractBalance + ownerBalance);
    }
}
// Path: contracts/StrategyTwo.sol