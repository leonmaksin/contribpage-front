import React, { useEffect, useState } from 'react';
import './App.css';
import {
  Connection, PublicKey, clusterApiUrl
} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import idl from './idl.json';
import kp from './keypair.json';
import Crystals from './sketches/crystals';

// import { Buffer } from 'buffer'
// globalThis.Buffer = Buffer

const BN = require('bn.js');

const { SystemProgram } = web3;
// const { SystemProgram, Keypair } = web3;

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
// let baseAccount = Keypair.generate();

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
}
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [itemList, setItemList] = useState(null);
  const [donationAmmount, setDonationAmmount] = useState(0);
  const [donationTotal, setDonationTotal] = useState(0);
  const [donating, setDonating] = useState(false);
  const [donated, setDonated] = useState(false);

  //item variables
  const [itemName, setItemName] = useState('');
  const [itemMessage, setItemMessage] = useState('');
  const [itemColor, setItemColor] = useState('#FFB4A2');
  // const [itemSize, setItemSize] = useState(null);
  // const [itemCoordX, setItemCoordX] = useState(null);
  // const [itemCoordY, setItemCoordY] = useState(null);

  const progressAlert = () => {
    alert('I love your enthusiasm, but this portion is still being built 🛠\nCheck back soon and I\'ll have it done 🤠');
  }

  const debug = false;
  const debugContainer = () => {
    if (itemList === null) {
      return (
        <div className="connected-container">
          { !walletAddress && renderWalletConnect() }
          <button className="cta-button submit-gif-button" onClick={createBaseAccount} style={{'marginTop': '50px'}}>
            Do One-Time Initialization For Item Program Account
          </button>
        </div>
      )
    }
    else {
      return (
        <button
          className="cta-button submit-gif-button vote-button"
          onClick={e => {
            console.log(itemList);
          }}
        >
          Check lists
        </button>
      )
    }
  }

  const payWithSolana = () => {
    connectSolanaWallet();
  }
  const connectSolanaWallet = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

          const response = await solana.connect();
          console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
          setDonated(true);
        } else {
          window.open('https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa','_blank');
        }
      } else {
        window.open('https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa','_blank');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const payWithEtherium = () => {
    progressAlert();
  }

  const payWithCard = () => {
    progressAlert();
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createBaseAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getItemList();

    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  function calcSize(x) {
    const exponent = Math.pow(x,0.8)/80;
    return 80 - (80/(Math.pow(Math.E,exponent)))
  }

  const sendItem = async () => {
    // checkIfWalletIsConnected();
    if (!walletAddress) return;
    
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      const donationAmmountFloat = parseFloat(donationAmmount);
      const itemSize = calcSize(donationAmmountFloat);
      const itemCoordX = 10+document.documentElement.clientWidth*0.8*Math.random();
      const itemCoordY = 10+580*Math.random();

      await program.rpc.addItem(itemName, new BN(donationAmmountFloat), itemMessage, new BN(itemSize),
      itemColor, new BN(itemCoordX), new BN(itemCoordY), new BN(new Date().getTime()),
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      
      console.log("Item successfully sent to program", itemMessage)
      await getItemList();
      window.location.reload();
    } catch (error) {
      console.log("Error sending item:", error)
    }
  };

  const renderWalletConnect = () => (
    <button
      className="cta-button"
      onClick={ connectSolanaWallet }
    >
      Connect to Wallet
    </button>
  );

  const renderPaymentForm = () => {
    return (
      <div>
        <div className="donate-container">
          <div className="input-row">
            <input type="radio" name="select" id="option-1"/>
            <input type="radio" name="select" id="option-2"/>
            <input type="radio" name="select" id="option-3"/>
            <input type="radio" name="select" id="option-4"/>
            <label for="option-1" className="option option-1" onClick={(e) => {setDonationAmmount(5.00.toFixed(2))}}>
              <span>$ 5</span>
            </label>
            <label for="option-2" className="option option-2" onClick={(e) => {setDonationAmmount(10.00.toFixed(2))}}>
              <span>$ 10</span>
            </label>
            <label for="option-3" className="option option-3" onClick={(e) => {setDonationAmmount(25.00.toFixed(2))}}>
              <span>$ 25</span>
            </label>
            <label for="option-4" className="option option-4" onClick={(e) => {setDonationAmmount(50.00.toFixed(2))}}>
              <span>$ 50</span>
            </label>
            <div className="option-money">
              <span className="dollar-icon">$</span>
              <input className="money-input" placeholder="xx.xx" type="number" step='0.01' onFocus={(e) => {
                document.getElementById("option-1").checked = false;
                document.getElementById("option-2").checked = false;
                document.getElementById("option-3").checked = false;
                document.getElementById("option-4").checked = false;
              }}
              value={donationAmmount}
              onChange={(event) => {
                const { value } = event.target;
                if (value == null) setDonationAmmount(null);
                else setDonationAmmount(parseFloat(parseFloat(value).toFixed(2)));
              }}
              ></input>
              <span className="money-underline"></span>
            </div>
          </div>
          <button
            className="cta-button pay-solana-button donate-button-small"
            onClick={ payWithSolana }
          >
            <img src="./images/solana.svg" alt="solana logo" className="button-img"></img>
            Pay with Solana | { 99.99 }% goes to charity
          </button>
          <button
            className="cta-button pay-etherium-button donate-button-small"
            onClick={ payWithEtherium }
          >
            <img src="./images/etherium.png" alt="etherium logo" className="button-img" style={{'marginRight': '4px'}}></img>
            Pay with Etherium | { 99 }% goes to charity
          </button>
          <button
            className="cta-button pay-card-button donate-button-small"
            onClick={ payWithCard }
          >
            <img src="./images/card.png" alt="card logo" className="button-img" style={{'marginRight': '10px'}}></img>
            Pay with card | { 97 }% goes to charity
          </button>
        </div>
      </div>
    )
  }

  const renderInputForm = () => {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendItem();
          setDonated(false);
          setDonating(false);
        }}
        className="crystal-form"
        style={{"borderColor": itemColor}}
      >
        <div className="input-row">
          <div className="input-label">
            <p className="input-main-text">Your Name</p>
            <p className="input-small-text">Optional</p>
          </div>
          <div className="input-input">
            <input
              type="text"
              placeholder="Enter your name!"
              className="message-input"
              value={itemName}
              onChange={(event) => {
                const { value } = event.target;
                setItemName(value);
              }}
            />
            </div>
        </div>

        <div className="input-row">
          <div className="input-label">
            <p className="input-main-text">Your Message</p>
            <p className="input-small-text">Optional</p>
          </div>
          <div className="input-input">
            <textarea
              type="text"
              placeholder="Enter your message!"
              value={itemMessage}
              onChange={(event) => {
                const { value } = event.target;
                setItemMessage(value);
              }}
            />
            </div>
        </div>

        <div className="input-row input-row-color">
          <div className="input-label">
            <p className="input-main-text">Your Color</p>
          </div>
          <div className="input-input">
            <input
              type="color"
              placeholder="Crystal color"
              className="smaller-input color-input"
              value={itemColor}
              onChange={(event) => {
                const { value } = event.target;
                setItemColor(value);
              }}
            />
            <div className="submit-row-box" style={{"backgroundColor": itemColor}}></div>
          </div>
        </div>

        <div className="input-row">
          <button type="submit" className="cta-button submit-form-button">Generate your crystal</button>
        </div>
      </form>
    )
  }

  const renderItemFields = () => {
    if (itemList === null) {
      return (
        <div className="connected-container">
          <p className="header margin-top-loading">Calling Solana blockchain...</p>
        </div>
      )
    }
    else {
      return (
        <div>
          { renderCrystals() }
          { renderDonationGrid() }
        </div>
      )
    }
  }

  const renderCrystals = () => {
    return (
      <Crystals itemListProp={itemList}/>
    )
  }

  const toDate = (timestamp) => {
    var date = new Date(timestamp.toNumber());
    var hours = date.getHours()%12;
    if (hours === 0) hours = 12;
    var minutes = date.getMinutes().toString();
    var ampm = date.getHours() < 12 ? 'am' : 'pm';
    if (minutes.length === 1) minutes = '0' + minutes;
    return  months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ', at ' + hours + ':' + minutes + ' ' + ampm;
  }

  const renderDonationGrid = () => {
    return (
      <div className="donation-grid">
        {itemList.map((item,index) => {
          return (
            <div key={index} className="crystal-tag">
              <div className="top-tag">
                <div className="top-left">
                  <p className="name"> {item.name} </p>
                  <p className="ownerid"> { item.owner.toString() } </p>
                </div>
                <div className="top-right">
                  <div className="top-right-block" style={{"backgroundColor": item.color}}></div>
                  <p className="top-right-text"><span className="bold opaque">${ item.ammount.toNumber() }</span> on { toDate(item.timestamp) }</p>
                </div>
              </div>
              <div className="bottom-tag">
                <p className="message"> {item.message} </p>
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  const renderConnectedContainer = () => {
    return (
      <div className="connected-container">
        { donating && renderPaymentForm() }
        { donating && donated && renderInputForm() }
        <div className="item-grid">
          { renderItemFields() }
        </div>
      </div>
    )
  };

  useEffect(() => {
    const onLoad = async () => {
      // await checkIfWalletIsConnected();
      await getItemList();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  },);

  const getItemList = async() => {
    console.log("Fetching item list...")
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setItemList(account.itemList);
      setDonationTotal(account.donationTotal.toNumber());

    } catch (error) {
      console.log("Error in getItemList: ", error)
      setItemList(null);
    }
  }

  return (
    <div className="App">
      {/* <div className={walletAddress ? 'authed-container' : 'container'}> */}
      <div className='authed-container'>
        <div className="header-container">
          {/* <p className="sub-text">
            Thanks for checking out This project is currently a work in progress, feel free to <br></br>
            generate a crystal with your solana wallet for now 🚀
          </p> */}
          { debug && debugContainer() }
          <p className="header">
            AngelBoard 😇
          </p>
          <p className="sub-text">
            Donate for a cause and earn your spot on the Solana blockchain ⚡️💸
          </p>
          <p className="donation-counter">
            
          </p>
          <button
            className="donate-button"
            onClick={ e => {
              setDonating(!donating)
            }}
          >
            <div className="donate-box">
              <p className="donate-now">DONATE NOW</p>
              <p className="donation-counter">${ donationTotal } raised</p>
            </div>
          </button>
          { renderConnectedContainer() }
          {/* {walletAddress && renderConnectedContainer()} */}
          {/* {!walletAddress && renderNotConnectedContainer()} */}
        </div>
      </div>
    </div>
  );
}

export default App;
