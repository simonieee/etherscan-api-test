require("dotenv").config();
const Web3 = require("web3");
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

const contract = require("./contractApi");
const etherscanApi = require("./etherscanApi");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Api = {
  /**
   * Internal Tx ETH 총합
   * @param {*} address
   * @returns
   */
  getTotalInternalTxValue: async (address) => {
    try {
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
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계정에서 발생한 총 출금액
   * @param {*} address
   * @returns
   */
  totalWithdrawBalance: async (address) => {
    try {
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
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계정에서 발생한 총 입금액
   * @param {*} address
   * @returns
   */
  totalBalanceReceive: async (address) => {
    try {
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
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계정이 가지고 있는 Aave Pool에서 지원하는 토큰의 개수
   * @param {*} address
   * @returns
   */
  getTotalTokenBalanceByAddress: async (address) => {
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
            : tokenInfo.name]: Number(tokenInfo.balance),
        };
      }
      return tokenInfoList;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계좌에서 해당 Pool과 관련된 대출 정보
   * @param {*} ca
   * @param {*} provider
   * @param {*} addr
   * @returns
   */
  getUserReservesData: async (ca, provider, addr) => {
    try {
      const abi = await etherscanApi.getTokenABI(ca);

      const userReservesData = await contract.getUserReservesData(
        JSON.parse(abi),
        ca,
        provider,
        addr
      );
      const result = [];
      userReservesData[0].map((i) => {
        const a = {
          underlyingAsset: i[0],
          scaledATokenBalance: i[1],
          usageAsCollateralEnabledOnUser: i[2],
          stableBorrowRate: i[3],
          scaledVariableDebt: i[4],
          principalStableDebt: i[5],
          stableBorrowLastUpdateTimestamp: i[6],
        };
        result.push(a);
      });
      return result;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 대출 및 보유 잔액 반환 (Eth단위)
   * @param {*} ca
   * @param {*} provider
   * @param {*} addr
   * @returns
   */
  getReservesScaleData: async (ca, provider, addr) => {
    try {
      const reservesData = await Api.getUserReservesData(ca, provider, addr);
      const result = {
        scaledATokenBalance: 0,
        scaledVariableDebt: 0,
      };

      reservesData.map((i) => {
        result.scaledATokenBalance +=
          parseInt(i.scaledATokenBalance) * Math.pow(10, -18);
        result.scaledVariableDebt +=
          parseInt(i.scaledVariableDebt) * Math.pow(10, -6);
      });
      return result;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계정 Defi 활동 기간
   * @param {*} addr
   * @returns
   */
  getActivityTime: async (addr) => {
    try {
      const firstDefiTx = await etherscanApi.getDefiTxs(addr, "asc");
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (firstDefiTx.length > 0) {
        const timeDifference =
          (currentTimestamp - parseInt(firstDefiTx[0].timeStamp)) / (3600 * 24);

        return timeDifference;
      } else {
        return 0;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계정의 Onchain 활동 기간
   * @param {*} addr
   * @returns
   */
  getOnchainActivityTime: async (addr) => {
    try {
      const firstTx = await etherscanApi.getNormalTxByAddress(addr);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (firstTx.length > 0) {
        const timeDifference =
          (currentTimestamp - parseInt(firstTx[0].timeStamp)) / (3600 * 24);
        return timeDifference;
      } else {
        return 0;
      }
    } catch (e) {
      console.log(e);
      return falses;
    }
  },
};

module.exports = Api;
