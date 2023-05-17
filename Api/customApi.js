require("dotenv").config();
const Web3 = require("web3");
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

const contract = require("./contractApi");
const etherscanApi = require("./etherscanApi");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = {
  /**
   * Internal Tx ETH 총합
   * @param {*} address
   * @returns
   */
  getTotalInternalTxValue: async (address) => {
    const internalTx = await etherscanApi.getInternalTxByAddress(address);
    let balance = 0;
    let count = 0;
    internalTx.map((i) => {
      balance += parseInt(i.value);
      count++;
    });
    const result = {
      balance: balance * Math.pow(10, -18),
      count: count,
    };
    return result;
  },
};
