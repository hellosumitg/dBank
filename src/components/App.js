import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    //checking if MetaMask exists
    if(typeof window.ethereum!=='undefined'){
      //assigning to values to variables: web3, netId, accounts
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId() // for `NetworkID` or `ChainID` here `netId`
      const accounts = await web3.eth.getAccounts()
      // console.log(accounts[0]) // for checking the current connected account

      //check if account is detected, then load balance & setStates, else push alert
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        // console.log(balance) // for checking the current account balance
        // Now, we are going to use react setState for getting and setting, object values (i.e like we get it from a database) such as accounts, balance and web3 connection here.
        this.setState({account: accounts[0], balance: balance, web3: web3}) 
      } else {
        window.alert('Please login with MetaMask')
      }

      //in try block load contracts using web3 library with abis
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address) // here we are creating a new web3 version Token contract
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address) // here we are creating a new web3 version dBank contract
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress}) // here we are using react setState for saving all the above variable values as object values.
        // console.log(dBankAddress)
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    //if MetaMask not exists push alert
    } else {
      window.alert('Please install MetaMask')
    }
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
      //in try block call dBank deposit();
      try{
        // `methods.myMethod.send`taken from web3.js, read more here:-https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#methods-mymethod-send
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    //prevent button from default click
    e.preventDefault()
    //checking if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
      //in try block call dBank withdraw();
      try{
        // `methods.myMethod.send`taken from web3.js, read more here:-https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#methods-mymethod-send
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  async borrow(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        // `methods.myMethod.send`taken from web3.js, read more here:-https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#methods-mymethod-send
        await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }

  async payOff(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        // `methods.myMethod.call`taken from web3.js, read more here:-https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#methods-mymethod-call
        const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
        const tokenBorrowed = collateralEther/2
        // `methods.myMethod.send`taken from web3.js, read more here:-https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#methods-mymethod-send
        await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
        await this.state.dbank.methods.payOff().send({from: this.state.account})
      } catch(e) {
        console.log('Error, pay off: ', e)
      }
    }
  }

  async Interest(e) {
    if(this.state.dbank!=='undefined'){
      try{
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        // `methods.myMethod.call`taken from web3.js, read more here:-https://web3js.readthedocs.io/en/v1.7.3/web3-eth-contract.html#methods-mymethod-call
        const tokenBalance = await token.methods.balanceOf(this.state.account).call()
        alert(web3.utils.fromWei(tokenBalance))
      } catch (e) {
        console.log('Error', e)
      }
    }
  }


  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://github.com/sumitdevtech"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to 'Rinkeby-Testnet' d₿ank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                
                
                <Tab eventKey="deposit" title="Deposit">
                  <div>
                    <br/>
                    How much do you want to deposit?
                    <br/>
                    (min. amount is 0.01 ETH)
                    <br/>
                    (1 deposit is possible at a time)
                    <br/>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //converting to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <br/>
                          <input
                            id='depositAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.depositAmount = input }}
                            className="form-control form-control-md"
                            placeholder='amount...'
                            required 
                          />
                      </div>
                      <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                    </form>
                  </div>
                </Tab>


                <Tab eventKey="withdraw" title="Withdraw">
                  <br/>
                  Do you want to withdraw + take interest?
                  <br/>
                  <br/>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>


                <Tab eventKey="borrow" title="Borrow">
                  <div>
                    <br/>
                    Do you want to borrow tokens?
                    <br/>
                    (You'll get 50% of collateral, in Tokens)
                    <br/>
                    Type collateral amount (in ETH)
                    <br/>
                    <br/>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10 **18 //converting to wei
                      this.borrow(amount)
                      }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>BORROW</button>
                    </form>
                  </div>
                </Tab>


                <Tab eventKey="payOff" title="Payoff">
                  <div>
                    <br/>
                    Do you want to payoff the loan?
                    <br/>
                    (You'll receive your collateral - fee)
                    <br/>
                    <br/>
                    <div>
                      <button type='submit' className='btn btn-primary' onClick={(e) => this.payOff(e)}>PAYOFF</button>
                    </div>
                  </div>
                </Tab>


                <Tab eventKey="Interest" title="Interest">
                  <br/>
                  Your Total Interest collected in the form of D₿C Token is:-
                  <br/>
                  <br/>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.Interest(e)}>INTEREST</button>
                  </div>
                </Tab>


              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}



export default App;