// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
  //adding minter variable
  address public minter; // person who mints the token

  // adding minter changed event
  event MinterChanged(address indexed from, address to);

  constructor() public payable ERC20("Decentralized Bank Currency", "DBC") {
    // assign initial minter
    minter = msg.sender;
  }

  // Adding pass minter role function to pass ownership from `deployer address` to `dBank address`
  function passMinterRole(address dBank) public returns(bool) {
    require(msg.sender==minter, 'Error, only owner can change and pass minter role');
    minter = dBank;

    emit MinterChanged(msg.sender, dBank);
    return true;
  }

  function mint(address account, uint256 amount) public {
    //check if msg.sender have minter role
    require(msg.sender == minter, 'Error, msg.sender does not have minter role'); // dBank
		_mint(account, amount);
	}
}