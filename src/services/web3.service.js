const Web3 = require("web3");
const { gethEndPoint, chainId } = require("../config");

const Tx = require("ethereumjs-tx");


// set up web3 object
let web3 = new Web3(new Web3.providers.HttpProvider(gethEndPoint));

/**
 * Used to fetch the current gas price of blockchain node
 */
exports.getGasPrice = async () => {
  try {
    return parseInt(await web3.eth.getGasPrice());
  } catch (error) {
    console.log("Error in getting the gas Price", error);
    throw error;
  }
};

/**
 * Fetched transaction details from blockchain
 */
exports.getTxDetails = async txHash => {
  try {
    let txDetail = await web3.eth.getTransaction(txHash);
    return txDetail
  } catch (error) {
    console.log("Error in getting the transaction detail", error);
    throw(error)
  }
};

/**
 * Estimates cost of executing a transaction on blockchain
 */
exports.estimateGas = async payload => {
  try {
    let { from, to, data, value = 0, nonce } = payload;
    let estimatedGas = await web3.eth.estimateGas({
      from,
      to,
      value,
      data,
      nonce
    });
    return estimatedGas;
  } catch (error) {
    console.log(`Failed to eeestimate gas`, {error})
    throw error
  }
};

/**
 * Fetches nonce of a given address including any pending transaction
 */
exports.getBcNonce = async address => {
  return await web3.eth.getTransactionCount(address, "pending");
};

/**
 * Creates and returns a contract instance provided abi and contract address
 */
exports.getContractInstance = (abi, address) => {
  return new web3.eth.Contract(abi,address)
}

/**
 * Submits a signed transaction to connected blockchain node
 */
exports.submitTransaction = async serializedTx => {
  try {
    return new Promise((fullfill, reject) => {
      web3.eth
        .sendSignedTransaction(serializedTx)
        .on("transactionHash", txHash => {
          console.log("transaction sent. hash =>", {txHash});
          return fullfill({ success: true, txHash: txHash });
        })
        .on("error", e => {
          console.log("unable to send tx", e);
          return fullfill({ success: false, message: e.message });
        });
    });
  } catch (e) {
    throw error
  }
};

/**
 * Converts a hexadecimal input to decimal
 */
exports.convertToDecimal = input => web3.utils.hexToNumber(input)


// This function needs to be moved to platform
exports.generateWallet = async() => {
  try {
    let wallet = web3.eth.accounts.create();
    const { address, privateKey } = wallet || {}
    return {  address, privateKey }
  } catch(error) {
    console.log(`Error in generating addding`, {error})
    throw error;
  }
}

// This funnction is to be moved to platform
exports.signTransaction =  async payload => {
  try {
    let { from, to, data, value = 0, gas, gasPrice, privKey, nonce } = payload;
    let bcNonce = await web3.eth.getTransactionCount(from, "pending");
    if (payload.nonce) nonce = Math.max(nonce, bcNonce);
    let txParams = {
      chainId,
      to,
      data,
      value: web3.utils.toHex(value),
      gasPrice: web3.utils.toHex(gasPrice),
      gas: web3.utils.toHex(gas),
      nonce: web3.utils.toHex(nonce)
    };
    let tx = new Tx(txParams);
    if (privKey.startsWith("0x")) privKey = privKey.substr(2);
    privKey  = Buffer.from(privKey, "hex")
    tx.sign(privKey);
    let serializedTx = "0x" + tx.serialize().toString("hex");
    return serializedTx;
  } catch (error) {
    console.log(`Error in signing tx`, {error})
    throw error
  }
};