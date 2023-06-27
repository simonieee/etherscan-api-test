require("dotenv").config();
const axios = require("axios");
const API_KEY = process.env.API_KEY;
const REQ_URL = process.env.REQ_URL;

const Api = {
  /**
   * 특정 계정에서 특정 토큰 개수 조회
   * @param {*} address
   * @param {*} ca
   * @returns
   */
  getTokenBalance: async (address, ca) => {
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
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계좌에서 보유한 ETH 개수 조회
   * @param {*} address
   * @returns
   */
  getBalance: async (address) => {
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
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  /**
   * 특정 계좌에서 보유한 특정 ERC20토큰에 대한 Transfer 이벤트 Tx 조회
   * @param {*} address
   * @param {*} ca
   * @returns
   */
  getERC20TokenTransferEvent: async (address, ca) => {
    try {
      const params = {
        module: "account",
        action: "tokentx",
        contractaddress: ca,
        address: address,
        startblock: "17000000",
        endblock: "latest",
        apikey: API_KEY,
      };
      const res = await axios({
        method: "get",
        url: REQ_URL,
        params: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;",
        },
        timeout: 10000,
        responseType: "json",
      });
      return res.data.result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /**
   * 특정 계좌에서 보유한 특정 ERC721토큰에 대한 Transfer 이벤트 Tx 조회
   * @param {*} address
   * @param {*} ca
   * @returns
   */
  getERC721TokenTransferEvent: async (address, ca) => {
    try {
      const params = {
        module: "account",
        action: "tokennfttx",
        contractaddress: ca,
        address: address,
        startblock: "17000000",
        endblock: "latest",
        apikey: API_KEY,
      };
      const res = await axios({
        method: "get",
        url: REQ_URL,
        params: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;",
        },
        timeout: 10000,
        responseType: "json",
      });
      return res.data.result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /**
   * 특정 계좌에서 보유한 특정 ERC721토큰에 대한 Transfer 이벤트 Tx 조회
   * @param {*} address
   * @param {*} ca
   * @returns
   */
  getERC1155TokenTransferEvent: async (address, ca) => {
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
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /**
   * 특정 계정에서 발생한 Internal Tx 조회
   * @param {*} address
   * @returns
   */
  getInternalTxByAddress: async (address) => {
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
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /**
   * 특정 계좌에서 발생한 트랜잭션 조회
   * @param {*} address
   * @returns
   */
  getNormalTxByAddress: async (address) => {
    try {
      const params = {
        module: "account",
        action: "txlist",
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
        responseType: "json",
      });
      return res.data.result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /**
   * 특정 컨트랙트 주소에 대한 Abi 조회
   * @param {*} ca
   * @returns
   */
  getTokenABI: async (ca) => {
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
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  /**
   * 특정 계정에서 발생한 Defi 관련 트랜잭션 조회(오름,내림차순 정렬 가능)
   * @param {*} address
   * @param {*} asc
   * @returns
   */
  getDefiTxs: async (address, asc) => {
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
  },
  getERC20TokenHolding: async (address) => {
    try {
      const params = {
        module: "account",
        action: "addresstokenbalance",
        address: address,
        page: 1,
        offset: 100,
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
      console.log(error);
      return false;
    }
  },
  getERC721TokenHolding: async (address) => {
    try {
      const params = {
        module: "account",
        action: "addresstokennftbalance",
        address: address,
        page: 1,
        offset: 100,
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
      console.log(error);
      return false;
    }
  },
};

module.exports = Api;
