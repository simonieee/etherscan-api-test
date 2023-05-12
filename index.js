const axios = require("axios");
const fs = require("fs");
const xlsx = require("xlsx");
require("dotenv").config();
const contract = require("./borrow");
const API_KEY = process.env.API_KEY;
const REQ_URL = process.env.REQ_URL;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tokenContractList = [
  {
    name: "BNB",
    addr: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    decimals: 18,
  },
  {
    name: "USDT",
    addr: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
  {
    name: "USDC",
    addr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  {
    name: "stETH",
    addr: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    decimals: 18,
  },
  {
    name: "UNI",
    addr: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
  },
];
// BNB: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
// USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
// USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
// stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
// HEX: "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39",
// MATIC: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
// UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",

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
        decimals: param.decimals,
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
      responseType: "json",
    });
    const balance = parseInt(res.data.result) * Math.pow(10, -18);
    return balance;
  } catch (error) {
    console.error(error);
  }
};

/**
 * 특정 ERC-20 Token의 전송기록 조회
 * @param {String} address
 * @param {String} ca
 * @returns
 */
const getERC20TokenTransferEvent = async (address, ca) => {
  try {
    const params = {
      module: "account",
      action: "tokentx",
      contractaddress: ca,
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
      responseType: "json",
    });
    return res.data.result;
  } catch (error) {
    console.error(error);
  }
};

const getERC721TokenTransferEvent = async (address, ca) => {
  try {
    const params = {
      module: "account",
      action: "tokennfttx",
      contractaddress: ca,
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

const getERC1155TokenTransferEvent = async (address, ca) => {
  try {
    const params = {
      module: "account",
      action: "token1155tx",
      contractaddress: ca,
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

const getInternalTxByAddress = async (address) => {
  try {
    const params = {
      module: "account",
      action: "txlistinternal",
      address: address,
      tag: "latest",
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

/**
 * Internal Tx ETH 총합
 * @param {*} address
 * @returns
 */
const getTotalInternalTxValue = async (address) => {
  const internalTx = await getInternalTxByAddress(address);
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
};

const getNormalTxByAddress = async (address) => {
  try {
    const params = {
      module: "account",
      action: "txlist",
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
      responseType: "json",
    });
    return res.data.result;
  } catch (error) {
    console.error(error);
  }
};

const totalWithdrawBalance = async (address) => {
  const tx = await getNormalTxByAddress(address);
  let balance = 0;
  let count = 0;
  tx.map((i) => {
    if (i.from.toLowerCase() === address.toLowerCase()) {
      balance += parseInt(i.value);
      count++;
    }
  });
  const result = {
    balance: balance * Math.pow(10, -18),
    count: count,
  };
  return result;
};

const totalBalanceReceive = async (address) => {
  const tx = await getNormalTxByAddress(address);
  let balance = 0;
  let count = 0;
  tx.map((i) => {
    if (i.to.toLowerCase() === address.toLowerCase()) {
      balance += parseInt(i.value);
      count++;
    }
  });
  const result = {
    balance: balance * Math.pow(10, -18),
    count: count,
  };
  return result;
};

/**
 * 해당 토큰 컨트랙트 주소로 ABI 얻어오기
 * @param {*} ca
 * @returns
 */
const getTokenABI = async (ca) => {
  try {
    const params = {
      module: "contract",
      action: "getabi",
      address: ca,
      apikey: API_KEY,
    };
    const res = await axios({
      method: "get",
      url: REQ_URL,
      params: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;",
      },
      responseType: "json",
    });
    return res.data.result;
  } catch (error) {
    console.error(error);
  }
};

// 토큰 컨트랙트 반복문 돌려서 해당 토큰들의 개수 수집
const getTotalTokenBalanceByAddress = async (address) => {
  try {
    const tokenList = await contract.getTokenList();
    let tokenAbiList = [];
    let tokenInfoList = [];
    for (const addr of tokenList) {
      const tokenABI = await getTokenABI(addr);
      tokenAbiList.push(JSON.parse(tokenABI));
      await delay(200);
    }

    await Promise.all(tokenAbiList);

    for (const [index, abi] of tokenAbiList.entries()) {
      console.log(index, abi);
      const tokenInfo = await contract.getATokenBalance(
        abi,
        address,
        tokenList[index]
      );
      tokenInfoList.push(tokenInfo);
    }
    console.log(tokenInfoList);
    // const tokenBalanceList = {};

    // const tokenBalance = await contract.getATokenBalance(
    //   tokenABI,
    //   address,
    //   ca
    // );
    // result = {
    //   ...tokenBalanceList,

    // }
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  // const addr = "0x2a14bcbB49d4a489Fe314aF57848F5F77A78bea2";
  const addr = "0x9b54264D7502f80163EA949038aAd771EAe67E38";
  await getTotalTokenBalanceByAddress(addr);
  //internal Tx ETH 총합
  // const totalInternalValue = await getTotalInternalTxValue(addr);

  // // 지갑 보유 ETH
  // const balance = await getBalance(addr);

  // // 해당 계좌에서 송금한 총 ETH량
  // const totalWithdraw = await totalWithdrawBalance(addr);

  // // 해당 계좌로 입금된 총 ETH량
  // const totalReceive = await totalBalanceReceive(addr);

  // // 입금 - 출금 (트랜잭션을 10000개만 조회하기에 -가될 수 있음)
  // const totalInterestEarned = totalReceive.balance - totalWithdraw.balance;
  // const aTokenBalance = await contract.getBorrowBalance(addr);
  // const result = {
  //   wallet_address: addr,
  //   balance: balance,
  //   total_withdraw: totalWithdraw.balance,
  //   withdraw_count: totalWithdraw.count,
  //   total_receive: totalReceive.balance,
  //   receive_count: totalReceive.count,
  //   total_interest_earned: totalInterestEarned,
  //   total_internal_value: totalInternalValue.balance,
  //   internal_tx_count: totalInternalValue.count,
  //   defiData: {
  //     totalCollateralBase:
  //       parseInt(aTokenBalance.totalDebtBase) * Math.pow(10, -18),
  //     totalDebtBase: parseInt(aTokenBalance.totalDebtBase) * Math.pow(10, -18),
  //     availableBorrowsBase:
  //       parseInt(aTokenBalance.availableBorrowsBase) * Math.pow(10, -18),
  //     currentLiquidationThreshold: aTokenBalance.currentLiquidationThreshold,
  //     ltv: aTokenBalance.ltv,
  //     healthFactor:
  //       (Number(
  //         BigInt("0x" + aTokenBalance.healthFactor) /
  //           BigInt("0x10000000000000000")
  //       ) /
  //         2 ** 64) *
  //       100,
  //   },
  // };
  // console.table({
  //   wallet_address: "이더리움 지갑 주소",
  //   balance: "보유하고 있는 ETH 개수",
  //   total_withdraw: "해당 계좌에서 송금한 총 ETH량",
  //   withdraw_count: "해당 계좌에서 송금 트랜잭션 발생 수",
  //   total_receive: "해당 계좌로 입금된 총 ETH량",
  //   receive_count: "해당 계좌로 입금 트랜잭션 발생 수",
  //   total_interest_earned: "예금 및 출금 금액(ETH 기준)의 차이",
  //   total_internal_value: "internal Tx ETH 총합",
  //   totalCollateralBase:
  //     "유저가 대출을 받을 때 담보로 제공한 자산의 총 가치(총 담보 금액)",
  //   totalDebtBase: "유저가 대출을 받았을 때 상환해야 할 총 금액(총 대출액)",
  //   availableBorrowsBase: "유저가 현재 대출 가능한 최대 금액(대출 가능 금액)",
  //   currentLiquidationThreshold:
  //     "일정 수준의 대출 안전성을 보장하기 위해 설정되는 임계치(threshold)",
  //   ltv: " 대출 상환액 대비 담보 가치 비율",
  //   healthFactor: "대출 상환 능력(1미만은 청산위험)",
  // });
  // console.log(result);

  // const test = await getNormalTxByAddress(
  //   "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
  // );
  // console.log(test);
  // const t = [];
  // test.map((i) => t.push(i.from));

  // const accounts = t.filter((i, idx) => {
  //   return t.indexOf(i) === idx;
  // });
  // console.log(accounts);

  // const token = await getTotalTokenBalance(addr);
  // const tokenTransfer = await getERC20TokenTransferEvent(
  //   addr,
  //   "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
  // );
  // const internalTx = await getInternalTxByAddress(addr);

  // const total = tokenContractList.map();
  // let amount = 0;
  // tokenTransfer.map((i) => {
  //   amount += parseInt(i.value);
  // });

  // console.log(`stETH 총 출금액 : ${amount * Math.pow(10, -18)}`);
  // console.log(`${addr}의 현재 잔액: ${balance * Math.pow(10, -18)}`);
  // token.map((i) => {
  //   console.log(
  //     `${i.name}: ${parseInt(i.balance) * Math.pow(10, -i.decimals)}`
  //   );
  // });
};

main();
