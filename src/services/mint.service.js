// @ts-check

const web3Service = require("./web3.service");
const abi = require("../config/abi")

const GWEI = 1000000000;
const contractAddress = "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"

const contractInstance = web3Service.getContractInstance(abi, contractAddress);


const mint = async payload => {
  try {

    let { from, gas, gasPrice, privateKey, nonce, additionalGasPrice, value } = payload;

    if(!from || !privateKey) throw("User address and private key is mendatory");

    if(!nonce || !gasPrice) {
      let { currentgasPrice, bcNonce} = await getAccountState(from);
      if(!nonce) nonce = bcNonce;
      if(!gasPrice) gasPrice = currentgasPrice;
    }

    if(additionalGasPrice) gasPrice += additionalGasPrice * GWEI;

    if(!gas) gas = 29583573

    let extraData = await contractInstance.methods["mint"](5);
    const data =  extraData.encodeABI();
    
    const signedTx = await web3Service.signTransaction({
      from,
      to: contractAddress,
      data,
      value,
      gas,
      gasPrice,
      privateKey,
      nonce
    });

    let txHash = await web3Service.submitTransaction(signedTx);
    console.log(txHash)
    return txHash;
  } catch(error) {
    console.log(error);
    throw error;
  }

}

const getAccountState = async address =>  {
  const [currentgasPrice, bcNonce ] = await Promise.all([
    web3Service.getGasPrice(),
    web3Service.getBcNonce(address),
  ])
  return { currentgasPrice, bcNonce };
}

module.exports = {
  mint,
  getAccountState
}