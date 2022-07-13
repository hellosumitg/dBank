/* eslint-disable no-undef */
// In migration folders we write `deploy script/migration script` which helps in putting the smart contract on the `Blockchain`(i.e migrating/moving the smart contract from our computer to a `Blockchain`) 
// or in overword migrating the blockchain's state from one state to another...

const Token = artifacts.require("Token");
const dBank = artifacts.require("dBank");

module.exports = async function(deployer) {
	//deploying Token
	await deployer.deploy(Token);

	//assigning token into variable to get it's address
	const token = await Token.deployed();
	
	//passing token address for dBank contract(for future minting)
	await deployer.deploy(dBank, token.address);

	//assigning dBank contract into variable to get it's address
	const dbank = await dBank.deployed();

	//changing token's owner/minter from deployer to dBank
	await token.passMinterRole(dbank.address);
};