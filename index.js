const axios = require("axios");
const fs = require("fs");
const xlsx = require("xlsx");
const Web3 = require("web3");
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

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

/**
 * 특정 계정에서 발생한 특정 토큰에 대한 이벤트 트랜잭션 조회
 * @param {*} address
 * @param {*} ca
 * @returns
 */
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

/**
 * 특정 계정에서 발생한 Internal Tx 조회
 * @param {*} address
 * @returns
 */
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

/**
 * 특정 계정에서 발생한 트랜잭션 목록 조회
 * @param {*} address
 * @returns
 */
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

/**
 * 특정 계정에서 발생한 총 입금액
 * @param {*} address
 * @returns
 */
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

/**
 * 특정 계정에서 발생한 총 송금액
 * @param {*} address
 * @returns
 */
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

/**
 * 특정 계정이 가지고 있는 Aave Pool에서 지원하는 토큰의 개수
 * @param {*} address
 * @returns
 */
const getTotalTokenBalanceByAddress = async (address) => {
  try {
    const tokenList = await contract.getTokenList();
    let tokenAbiList = [];
    let tokenInfoList = {};
    for (let addr of tokenList) {
      switch (addr) {
        case "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
          const tokenABI = await getTokenABI(
            "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf"
          );
          tokenAbiList.push(JSON.parse(tokenABI));
          break;
        }
        case "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704": {
          const tokenABI = await getTokenABI(
            "0x31724ca0c982a31fbb5c57f4217ab585271fc9a5"
          );
          tokenAbiList.push(JSON.parse(tokenABI));
          break;
        }
        case "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": {
          const tokenABI = await getTokenABI(
            "0x96f68837877fd0414b55050c9e794aecdbcfca59"
          );
          tokenAbiList.push(JSON.parse(tokenABI));
          break;
        }
        default: {
          const tokenABI = await getTokenABI(addr);
          tokenAbiList.push(JSON.parse(tokenABI));
        }
      }
      await delay(200);
    }

    await Promise.all(tokenAbiList);

    for (const [index, abi] of tokenAbiList.entries()) {
      const tokenInfo = await contract.getATokenBalance(
        abi,
        address,
        tokenList[index]
      );
      tokenInfoList = {
        ...tokenInfoList,
        // [tokenInfo.name]: tokenInfo.balance,
        [tokenInfo.name ===
        "0x4d4b520000000000000000000000000000000000000000000000000000000000"
          ? web3.utils.hexToUtf8(tokenInfo.name).toString()
          : tokenInfo.name]: tokenInfo.balance,
      };
    }
    return tokenInfoList;
  } catch (error) {
    console.error(error);
  }
};

/**
 * 특정 계정의 Defi 관련 Tx 추출, asc는 오름,내림차순 정렬 가능
 * @param {*} address
 * @param {*} asc
 * @returns
 */
const getDefiTxs = async (address, asc) => {
  try {
    const params = {
      module: "account",
      action: "txlist",
      address: address,
      startblock: 0,
      endblock: 99999999,
      tag: "latest",
      sort: asc,
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
    const tx = res.data.result;
    const defiTx = tx.filter((item) => item.input !== "0x");
    return defiTx;
  } catch (error) {
    console.log(error);
  }
};

const getUserReservesData = async (ca, provider, addr) => {
  const abi = await getTokenABI(ca);
  // await Promise.all(abi);
  const userReservesData = await contract.getUserReservesData(
    JSON.parse(abi),
    ca,
    provider,
    addr
  );
  return userReservesData;
};

/**
 * 특정 계정의 온체인 + 오프체인 활동 데이터
 * @param {*} addr
 */
const getData = async (addr) => {
  try {
    // const addr = "0x2a14bcbB49d4a489Fe314aF57848F5F77A78bea2";
    const TokenBalance = await getTotalTokenBalanceByAddress(addr);
    // internal Tx ETH 총합
    const totalInternalValue = await getTotalInternalTxValue(addr);

    // 지갑 보유 ETH
    const balance = await getBalance(addr);

    // 해당 계좌에서 송금한 총 ETH량
    const totalWithdraw = await totalWithdrawBalance(addr);

    // 해당 계좌로 입금된 총 ETH량
    const totalReceive = await totalBalanceReceive(addr);

    // 입금 - 출금 (트랜잭션을 10000개만 조회하기에 -가될 수 있음)
    const totalInterestEarned = totalReceive.balance - totalWithdraw.balance;
    const aTokenBalance = await contract.getBorrowBalance(addr);
    const activityTime = await getActivityTime(addr);
    const result = {
      wallet_address: addr,
      balance: balance,
      total_withdraw: totalWithdraw.balance,
      withdraw_count: totalWithdraw.count,
      total_receive: totalReceive.balance,
      receive_count: totalReceive.count,
      total_interest_earned: totalInterestEarned,
      total_internal_value: totalInternalValue.balance,
      internal_tx_count: totalInternalValue.count,
      ReservesBalanceByAddress: TokenBalance,
      defiData: {
        activityTime: activityTime,
        totalCollateralBase:
          parseInt(aTokenBalance.totalDebtBase) * Math.pow(10, -18),
        totalDebtBase:
          parseInt(aTokenBalance.totalDebtBase) * Math.pow(10, -18),
        availableBorrowsBase:
          parseInt(aTokenBalance.availableBorrowsBase) * Math.pow(10, -18),
        currentLiquidationThreshold: aTokenBalance.currentLiquidationThreshold,
        ltv: aTokenBalance.ltv,
        healthFactor:
          (Number(
            BigInt("0x" + aTokenBalance.healthFactor) /
              BigInt("0x10000000000000000")
          ) /
            2 ** 64) *
          100,
      },
    };
    console.table({
      wallet_address: "이더리움 지갑 주소",
      balance: "보유하고 있는 ETH 개수",
      total_withdraw: "해당 계좌에서 송금한 총 ETH량",
      withdraw_count: "해당 계좌에서 송금 트랜잭션 발생 수",
      total_receive: "해당 계좌로 입금된 총 ETH량",
      receive_count: "해당 계좌로 입금 트랜잭션 발생 수",
      total_interest_earned: "예금 및 출금 금액(ETH 기준)의 차이",
      total_internal_value: "internal Tx ETH 총합",
      totalCollateralBase:
        "유저가 대출을 받을 때 담보로 제공한 자산의 총 가치(총 담보 금액)",
      totalDebtBase: "유저가 대출을 받았을 때 상환해야 할 총 금액(총 대출액)",
      availableBorrowsBase: "유저가 현재 대출 가능한 최대 금액(대출 가능 금액)",
      currentLiquidationThreshold:
        "일정 수준의 대출 안전성을 보장하기 위해 설정되는 임계치(threshold)",
      ltv: " 대출 상환액 대비 담보 가치 비율",
      healthFactor: "대출 상환 능력(1미만은 청산위험)",
      activityTime:
        "해당 유저가 Defi 활동기간(최초 활동 트랜잭션에서 현재 시간까지의 시간)",
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 특정 계정 Defi 활동 기간
 * @param {*} addr
 * @returns
 */
const getActivityTime = async (addr) => {
  const firstDefiTx = await getDefiTxs(addr, "asc");
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const timeDifference =
    (currentTimestamp - parseInt(firstDefiTx[0].timeStamp)) / (3600 * 24);

  return timeDifference;
};

const main = async () => {
  const addr = "0x1967901aAAE1Ca6b65d91Ac4f0539F8687220e89";
  const ca = "0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d";
  const provider = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";
  getUserReservesData(ca, provider, addr);
  getData(addr);
};

main();
