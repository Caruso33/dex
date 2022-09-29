//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Caruso 33 Token", "C33T") {
        uint256 initialSupply = 1_000_000 * (10**18);
        _mint(msg.sender, initialSupply);
    }
}
