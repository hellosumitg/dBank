// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./Token.sol";



contract dBank {

  //assigning Token contract to variable(i.e declaring)
  Token private token;

  //adding mappings 
  mapping(address => uint) public depositStart; // `account address => deposit starting time`
  mapping(address => uint) public etherBalanceOf; // `account address => deposited amount of ETH`
  mapping(address => uint) public collateralEther; // `account address => collateralized amount of ETH`

  // `depositStart` is for getting block-time on the blockchain, so as to give/calculate the `amount of interest` on the time passed since the deposit.
  mapping(address => bool) public isDeposited; // used for checking whether account address earlier deposited or not.
  mapping(address => bool) public isBorrowed; // used for checking whether account address earlier borrowed or not. 

  //adding events
  event Deposit(address indexed user, uint etherAmount, uint timeStart);
  event Withdraw(address indexed user, uint etherAmount, uint depositTime,  uint timeStart);
  event Borrow(address indexed user, uint collateralEtherAmount, uint borrowedTokenAmount);
  event PayOff(address indexed user, uint fee);

  //passing the deployed `Token contract address`(i.e Token _token) as constructor argument 
  constructor(Token _token) public {
    //assigning deployed Token contract to variable
    token = _token;
  }

  
  function deposit() payable public {
    //checking if `msg.sender`(i.e address of the depositor in the `isDeposited` mapping) didn't already deposited funds
    require(isDeposited[msg.sender] == false, 'Error, deposit is already active');
    
    //checking if msg.value is >= 0.01 ETH
    require(msg.value >= 1e16, 'Error, deposit must be >= 0.01 ETH');

    //increasing `msg.sender's` `ETH` deposit balance(i.e incrementing a specific address in the `etherBalanceOf` mapping))
    etherBalanceOf[msg.sender] += msg.value; // i.e `etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value`; in `ETH`.

    //starting `msg.sender's hodling/holding time from the block creation time for a specific address in the `depositStart` mapping
    depositStart[msg.sender] += block.timestamp; // i.e `depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;` in seconds.

    //setting `msg.sender's`(i.e a specific address in the `isDeposited` mapping) deposit status to true
    isDeposited[msg.sender] = true; //activate deposit status

    //emitting Deposit event
    emit Deposit(msg.sender, msg.value, block.timestamp);
  }

  
  function withdraw() public {
    //checking if `msg.sender's`(i.e a specific address in the `isDeposited` mapping) deposit status is true
    require(isDeposited[msg.sender] == true, 'Error, no previous deposit');

    //assigning `msg.sender's`(i.e a specific address in the `etherBalanceOf` mapping) amount of ether deposit(i.e balance) to a variable for `Withdraw` event
    uint userBalance = etherBalanceOf[msg.sender]; // for `Withdraw` event

    //checking user's HODL time(i.e holding time)
    uint depositTime = block.timestamp - depositStart[msg.sender]; // for `Withdraw` event in terms of seconds.

    //How we will calculate interest per second:-

    // 31668017 wei ( i.e interest(10% APY) per second for minimum deposit amount (0.01 ETH) ),
    // which we get by solving this ` 1e15(i.e 10% of 0.01 ETH in terms of wei) / 31577600 (i.e seconds in 365.25 days)  `

    //(etherBalanceOf[msg.sender] / 1e16) - calc. how much higher interest will be (based on deposit), e.g.:
    //for minimum deposit of `0.01 ETH`, (etherBalanceOf[msg.sender] / 1e16) = 1 (the same, 31668017 wei/s)
    //for deposit of `0.02 ETH`, (etherBalanceOf[msg.sender] / 1e16) = 2 (doubled, (2*31668017)/s)
    uint interestPerSecond = 31668017  *   ( etherBalanceOf[msg.sender] / 1e16 );
    //                         wei/s      `number of times`(i.e of the minimum deposit amount)
    
    //calculating accrued interest
    uint interest = interestPerSecond * depositTime; //for `Withdraw` event
 
    //sending eth to a specific user address in the `etherBalanceOf` mapping
    msg.sender.transfer(etherBalanceOf[msg.sender]);

    //sending interest in terms `tokens` to user address
    token.mint(msg.sender, interest);

    //resetting depositor's(i.e a specific address in different mappings) data to initial/starting value i.e zero
    depositStart[msg.sender] = 0;
    etherBalanceOf[msg.sender] = 0;
    isDeposited[msg.sender] = false;

    //emitting Withdraw event
    emit Withdraw(msg.sender, userBalance, depositTime, interest);
  }

  
  function borrow() payable public {
    //checking if collateral is >=  0.01 ETH ( i.e minimum collateralized amount of `0.01 ETH` )
    require(msg.value>=1e16, 'Error, collateral must be >= 0.01 ETH');

    //checking if user doesn't have active loan
    require(isBorrowed[msg.sender] == false, 'Error, loan already taken');

    //adding `msg.value` (i.e `ETH` amount as collateral) to initial `collateralEther` amount(i.e initially its zero) for an specific address in `collateralEther` mapping.
    collateralEther[msg.sender] += msg.value; // collateralEther[msg.sender] = collateralEther[msg.sender] + msg.value;

    //calculating amount of token to be mint, i.e 50% of `msg.value` (i.e amount of collateralized `ETH`) for an specific address in `collateralEther` mapping.
    uint tokensToMint = collateralEther[msg.sender] / 2;

    //mint&send tokens to user
    token.mint(msg.sender, tokensToMint);

    //activating borrower's loan status for a specific address in the `isBorrowed` mapping
    isBorrowed[msg.sender] = true;

    //emitting Borrow event
    emit Borrow(msg.sender, collateralEther[msg.sender], tokensToMint);
  }

  
  function payOff() public {
    //checking if loan is active for a specific address in the `isBorrowed` mapping
    require(isBorrowed[msg.sender] == true, 'Error, loan not active');

    //transfer tokens from user(a specific address in the `collateral Ether` mapping) back to the contract
    require(token.transferFrom(msg.sender, address(this), collateralEther[msg.sender]/2), "Error, can't receive tokens"); //must approve dBank 1st

    //calculating 10% fee of a user's(a specific address in the `collateralEther` mapping) amount of `collateralEther`
    uint fee = collateralEther[msg.sender]/10; 

    //sending user's(a specific address in the `collateralEther` mapping) collateral minus fee
    msg.sender.transfer(collateralEther[msg.sender]-fee);

    //resetting borrower's data
    collateralEther[msg.sender] = 0;
    isBorrowed[msg.sender] = false;

    //emitting Payoff event
    emit PayOff(msg.sender, fee);
  }
}