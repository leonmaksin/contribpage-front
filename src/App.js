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
import p5 from 'p5';

// import { Buffer } from 'buffer'
// globalThis.Buffer = Buffer

const BN = require('bn.js');

const { SystemProgram, Keypair } = web3;

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
  const [itemColor, setItemColor] = useState('#cb42f5');
  const [itemSize, setItemSize] = useState(null);
  const [itemCoordX, setItemCoordX] = useState(null);
  const [itemCoordY, setItemCoordY] = useState(null);

  const progressAlert = () => {
    alert('I love your enthusiasm, but this portion is still being built 🛠\nCheck back soon and I\'ll have it done 🤠');
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

  const sendItem = async () => {
    // checkIfWalletIsConnected();
    if (!walletAddress) return;

    if (itemMessage.length == 0) {
      console.log("No message attached!")
      alert("Please submit a message ✍️");
      return
    }
    console.log('Item message:', itemMessage);
    
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addItem(itemName, new BN(donationAmmount), itemMessage, new BN(itemSize),
      itemColor, new BN(itemCoordX), new BN(itemCoordY), new BN(new Date().getTime()),
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      
      console.log("Item successfully sent to program", itemMessage)
      await getItemList();
      // const item = {
      //   coordx: itemCoordX,
      //   coordy: itemCoordY,
      //   color: itemColor,
      //   size: itemSize,
      // }
      // addCrystal(p5,item);
      window.location.reload();
    } catch (error) {
      console.log("Error sending item:", error)
    }
  };

  const renderWalletConnect = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={ connectSolanaWallet }
    >
      Connect to Wallet
    </button>
  );

  const renderPaymentForm = () => {
    return (
      <div>
        <div className="donate-container">
          {/* <input
            type="number"
            placeholder="Enter your message!"
            className="money-input"
            value={donationAmmount}
            onChange={(event) => {
              const { value } = event.target;
              setDonationAmmount(value);
            }}
          /> */}
          <button
            className="cta-button pay-solana-button donate-button-small"
            onClick={ payWithSolana }
          >
            <img src="./images/solana.svg" className="button-img"></img>
            Pay with Solana | { 99.99 }% goes to charity
          </button>
          <button
            className="cta-button pay-etherium-button donate-button-small"
            onClick={ payWithEtherium }
          >
            <img src="./images/etherium.png" className="button-img" style={{'marginRight': '4px'}}></img>
            Pay with Etherium | { 99 }% goes to charity
          </button>
          <button
            className="cta-button pay-card-button donate-button-small"
            onClick={ payWithCard }
          >
            <img src="./images/card.png" className="button-img" style={{'marginRight': '10px'}}></img>
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
        }}
        className="crystal-form"
      >
        <div className="col margin-sides-input">
          <div className="row justify-content-center">
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
            
            <input
              type="number"
              min="1"
              placeholder="Crystal size"
              className="smaller-input"
              value={itemSize}
              onChange={(event) => {
                const { value } = event.target;
                setItemSize(value);
              }}
            />
            
            <input
              type="number"
              placeholder="Crystal x-coordinate"
              className="smaller-input"
              value={itemCoordX}
              onChange={(event) => {
                const { value } = event.target;
                setItemCoordX(value);
              }}
            />
            
            <input
              type="number"
              placeholder="Crystal y-coordinate"
              className="smaller-input"
              value={itemCoordY}
              onChange={(event) => {
                const { value } = event.target;
                setItemCoordY(value);
              }}
            />
            
          </div>
        
          <div className="submit-row-box">
            <input
              type="text"
              placeholder="Enter your message!"
              className="message-input"
              value={itemMessage}
              onChange={(event) => {
                const { value } = event.target;
                setItemMessage(value);
              }}
            />
            <button type="submit" className="cta-button submit-gif-button">Submit</button>
          </div>
        </div>
      </form>
    )
  }

  const renderItemFields = () => {
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
    if (hours == 0) hours = 12;
    var minutes = date.getMinutes().toString();
    var ampm = date.getHours() < 12 ? 'am' : 'pm';
    if (minutes.length == 1) minutes = '0' + minutes;
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
                <div className="top-right" style={{"backgroundColor": item.color}}>
                  <p className="top-right-text"><span className="bold">${ item.ammount.toNumber() }</span> on { toDate(item.timestamp) }</p>
                </div>
              </div>
              <div className="bottom-tag">
                <p className="message"> {item.message} </p>
              </div>
              {/* <h1>{item.message}</h1> */}
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
        { donated && renderInputForm() }
        <div className="item-grid">
          { renderItemFields() }
        </div>
        {/* <button
          className="cta-button submit-gif-button vote-button"
          onClick={e => {
            console.log(itemList);
          }}
        >
          Check lists
        </button> */}
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
  }, []);

  const getItemList = async() => {
    console.log("Fetching item list...")
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setItemList(account.itemList)

    } catch (error) {
      console.log("Error in getItemList: ", error)
      setItemList(null);
    }
  }

  {/* useEffect(() => {
    if (walletAddress) {
      console.log('Fetching item list...');
      
      // CALL SOLANA PROGRAM
      getItemList()

      // setItemList(TEST_ITEMS);
    }
  }, [walletAddress]); */}

  return (
    <div className="App">
      {/* <div className={walletAddress ? 'authed-container' : 'container'}> */}
      <div className='authed-container'>
        <div className="header-container">
          {/* <p className="sub-text">
            Thanks for checking out This project is currently a work in progress, feel free to <br></br>
            generate a crystal with your solana wallet for now 🚀
          </p> */}
          <p className="header">
            Crystal Campaigns ✨
            {/* Contributions Page */}
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
          ><p style={{'marginBottom': '0px'}}>DONATE NOW</p>
          <p className="donation-counter">${ donationTotal } raised</p></button>
          { renderConnectedContainer() }
          {/* {walletAddress && renderConnectedContainer()} */}
          {/* {!walletAddress && renderNotConnectedContainer()} */}
        </div>
      </div>
    </div>
  );
}

export default App;
