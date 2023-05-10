const axios = require("axios");
require("dotenv").config();
const API_KEY = process.env.API_KEY;
const REQ_URL = process.env.REQ_URL;

const tokenContractList = [
  {
    name: "BNB",
    addr: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
  },
  {
    name: "USDT",
    addr: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
  {
    name: "USDC",
    addr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  {
    name: "MATIC",
    addr: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  {
    name: "UNI",
    addr: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  },
];
// BNB: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
// USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
// USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
// stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
// HEX: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
// MATIC: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
// UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",

const getTransactionByAccount = async (address) => {
  try {
    const params = {
      module: "account",
      action: "txlist",
      address: address,
      startblock: 0,
      endblock: 99999999,
      sort: "asc",
      apikey: API_KEY,
    };
    const res = await axios({
      method: "get",
      url: REQ_URL,
      params: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;",
      },
      timeout: 5000,
      responseType: "json",
    });
    return res.data.result;
  } catch (error) {
    console.error(error);
  }
};

const getTokenBalance = async (address, ca) => {
  try {
    const params = {
      module: "account",
      action: "tokenbalance",
      address: address,
      contractaddress: ca,
      tag: "latest",
      apikey: API_KEY,
    };
    const res = await axios({
      method: "get",
      url: REQ_URL,
      params: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;",
      },
      timeout: 5000,
      responseType: "json",
    });
    return res.data.result;
  } catch (error) {
    console.error(error);
  }
};

const getTotalTokenBalance = async (addr) => {
  try {
    const tokenList = [];
    for await (const param of tokenContractList) {
      const bc = await getTokenBalance(addr, param.addr);
      tokenList.push({
        name: param.name,
        balance: bc,
      });
    }
    return tokenList;
  } catch (error) {
    console.log(error);
  }
};

const getBalance = async (address) => {
  try {
    const params = {
      module: "account",
      action: "balance",
      address: address,
      tag: "latest",
      apikey: API_KEY,
    };
    const res = await axios({
      method: "get",
      url: REQ_URL,
      params: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;",
      },
      timeout: 5000,
      responseType: "json",
    });
    return res.data.result;
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  // const addr = "0x2a14bcbB49d4a489Fe314aF57848F5F77A78bea2";
  const addr = "0x50ec05ade8280758e2077fcbc08d878d4aef79c3";
  const balance = await getBalance(addr);
  // const ca = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";
  // const tx = await getTransactionByAccount(addr);
  // const transferTx = tx.filter((i) => i.methodId === "0x");
  // const tokenBalance = await getTokenBalance(addr, ca);
  // const tokenName = Object.keys(tokenContractList).find(
  //   (key) => tokenContractList[key] === ca
  // );
  // console.log(transferTx);
  // console.log("tokenBalance:" + tokenBalance);
  // console.log(tokenName);
  const token = await getTotalTokenBalance(addr);
  console.log(`${addr}의 현재 잔액: ${balance}`);
  token.map((i) => {
    console.log(`${i.name}: ${i.balance}`);
  });
};

main();
