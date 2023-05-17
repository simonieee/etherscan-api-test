const Web3 = require("web3");
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

require("dotenv").config();
const contract = require("./Api/contractApi");
const etherscanApi = require("./Api/etherscanApi");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Internal Tx ETH 총합
 * @param {*} address
 * @returns
 */
const getTotalInternalTxValue = async (address) => {
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
};

/**
 * 특정 계정에서 발생한 총 입금액
 * @param {*} address
 * @returns
 */
const totalWithdrawBalance = async (address) => {
  const tx = await etherscanApi.getNormalTxByAddress(address);
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
  const tx = await etherscanApi.getNormalTxByAddress(address);
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
          const tokenABI = await etherscanApi.getTokenABI(
            "0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf"
          );
          tokenAbiList.push(JSON.parse(tokenABI));
          break;
        }
        case "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704": {
          const tokenABI = await etherscanApi.getTokenABI(
            "0x31724ca0c982a31fbb5c57f4217ab585271fc9a5"
          );
          tokenAbiList.push(JSON.parse(tokenABI));
          break;
        }
        case "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9": {
          const tokenABI = await etherscanApi.getTokenABI(
            "0x96f68837877fd0414b55050c9e794aecdbcfca59"
          );
          tokenAbiList.push(JSON.parse(tokenABI));
          break;
        }
        default: {
          const tokenABI = await etherscanApi.getTokenABI(addr);
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

const getUserReservesData = async (ca, provider, addr) => {
  const abi = await etherscanApi.getTokenABI(ca);

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
    const balance = await etherscanApi.getBalance(addr);

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
  const firstDefiTx = await etherscanApi.getDefiTxs(addr, "asc");
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
