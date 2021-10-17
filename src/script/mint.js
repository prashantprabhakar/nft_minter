// @ts-check


// Script to mint NFTs
const mintService = require('../services/mint.service');
const { minters, additionalGasPrice, totalToMint} = require("../config")


let errorCount = 0; // to prevent script from running infinite
let minterNonce = {}

const mintNft = async(currentMinter) => {
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
      gas: 30000000,
      additionalGasPrice,
    });

    minterNonce[mintService] = minterNonce[minter] + 1;
    totalToMint += 5
    return txHash
  } catch(error) {
    console.log(error);
    throw error;
  }
}

while(totalToMint < 100 || errorCount >= 50) {
  try {
    for(let i=0; i< minters.length; i++) {
      mintNft(minters[i]).then( txHash => console.log("Tx Hash sent:", txHash) );
    }
  } catch(error) {
    console.log(error);
    errorCount ++;
  }
}
