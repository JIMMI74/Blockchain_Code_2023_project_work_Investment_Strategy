// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IMintableToken.sol";

contract Coupon is ERC20, Ownable, IMintableToken {
    event Mint(address indexed to, uint256 amount);

    constructor() ERC20("Coupon", "CPN") {
        _mint(address(this), 20000000000 * 10 ** decimals());
        _mint(owner(), 20000000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount cannot be 0");
        _mint(to, amount);
        emit Mint(to, amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) external override onlyOwner {
        _burn(account, amount);
    }
}

// Path: contracts/StrategyOne.sol