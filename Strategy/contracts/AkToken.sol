// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AkToken is ERC20, ERC20Burnable, Ownable {
                
    constructor() ERC20("AkToken", "AKT") {
       
        _mint(address(this), 10000000000 * 10 ** decimals());
        _mint(owner(),10000000000 * 10**decimals());

    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
}
