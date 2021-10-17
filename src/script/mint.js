// @ts-check


// Script to mint NFTs
const mintService = require('../services/mint.service');
const { minters, additionalGasPrice, totalToMint} = require("../config")


let errorCount = 0; // to prevent script from running infinite
let totalMinted = 0;
let minterNonce = {};
const mintfee = 1

const mintNft = async(currentMinter) => {
  console.log("minting...")
  try {
    let {
      minter,
      privateKey
    } = currentMinter
    
    if(!minterNonce[minter]) {
      let {bcNonce} = await mintService.getAccountState(minter);
      minterNonce[minter] = bcNonce
    }

    // from, gas, gasPrice, privateKey, nonce, additionalGasPrice
    let txHash = await mintService.mint({
      from: minter,
      privateKey,
      gas: 610200,
      additionalGasPrice,
      value: mintfee*5,
    });

    minterNonce[mintService] = minterNonce[minter] + 1;
    totalMinted += 5
    return txHash
  } catch(error) {
    console.log(error);
    throw error;
  }
}

async function start() {
  while(totalMinted < totalToMint || errorCount >= 5) {
    try {
      for(let i=0; i< minters.length; i++) {
        let txHash= await mintNft(minters[i]);
        console.log("Tx Hash sent:", txHash)
      }
    } catch(error) {
      console.log(error);
      errorCount ++;
    }
  }
}

start().then(() => console.log("done"))
