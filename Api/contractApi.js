require("dotenv").config();
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const { abi: lendingPoolAbi } = require("../Abi/lendingPoolABI.json");
const { abi: poolAbi } = require("../Abi/poolABI.json");

const Web3 = require("web3");
const web3 = new Web3(rpcEndpoint);

// LendingPoolAddressesProvider 컨트랙트 주소 설정
const lendingPoolAddressProviderAddress =
  "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";
const lendingPoolAddressProviderContract = new web3.eth.Contract(
  lendingPoolAbi,
  lendingPoolAddressProviderAddress
);

// LendingPoolAddressesProvider 컨트랙트에서 LendingPool 주소 가져오기
async function getLendingPoolAddress() {
  const lendingPoolAddress = await lendingPoolAddressProviderContract.methods
    .getPool()
    .call();
  return lendingPoolAddress;
}

// LendingPool 컨트랙트 인스턴스 생성
async function getLendingPoolContract() {
  const lendingPoolAddress = await getLendingPoolAddress();
  console.log(lendingPoolAddress);
  const lendingPoolContract = new web3.eth.Contract(
    poolAbi,
    lendingPoolAddress
  );
  return lendingPoolContract;
}
/**
 * 계정 주소 0x 제거
 * @param {*} hex
 * @returns
 */
function sliceAddr(hex) {
  const addr = hex.startsWith("0x") ? hex.slice(2) : hex;
  return addr;
}

const Api = {
  /**
   * 특정 계정에서 특정 토큰에 대한 잔액 가져오기
   * @param {*} abi
   * @param {*} address
   * @param {*} ca
   * @returns
   */
  getATokenBalance: async (abi, address, ca) => {
    const aTokenContract = new web3.eth.Contract(abi, ca);
    const tokenName = await aTokenContract.methods.symbol().call();
    const aTokenBalance = await aTokenContract.methods
      .balanceOf(address)
      .call();
    const tokenInfo = {
      name: tokenName,
      balance: aTokenBalance,
    };

    return tokenInfo;
  },
  /**
   * 특정 계정에서 Aave 프로토콜 내에서 대출 관련 내역 가져오기
   * @param {*} address
   * @returns
   */
  getBorrowBalance: async (address) => {
    const lendingPoolContract = await getLendingPoolContract();
    const borrowBalance = await lendingPoolContract.methods
      .getUserAccountData(address)
      .call();
    return borrowBalance;
  },
  /**
   * Aave Pool에 등록된 토큰 목록 조회
   * @returns
   */
  getTokenList: async () => {
    const lendingPoolContract = await getLendingPoolContract();
    const reservesList = await lendingPoolContract.methods
      .getReservesList()
      .call();
    console.log(reservesList);
    return reservesList;
  },
  /**
   * 특정 계좌에서 해당 Pool과 관련된 대출 정본
   * @param {*} abi
   * @param {*} ca
   * @param {*} provider
   * @param {*} addr
   * @returns
   */
  getUserReservesData: async (abi, ca, provider, addr) => {
    const uiPoolDataContract = new web3.eth.Contract(abi, ca);
    const userReservesData = await uiPoolDataContract.methods
      .getUserReservesData(provider, addr)
      .call();
    return userReservesData;
  },
  /**
   * 특정 계정 주소에서 발생한 대출 횟수 카운팅
   * @param {*} addr
   * @returns
   */
  getLoanTransactions: async (addr) => {
    try {
      const filter = {
        fromBlock: 0,
        toBlock: "latest",
        address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Aave Pool V3 Address
        topics: [
          "0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0",
          null,
          `0x000000000000000000000000${sliceAddr(addr)}`,
        ],
      };

      // 대출 이벤트 로그를 조회하여 거래 수 계산
      const logs = await web3.eth.getPastLogs(filter);
      return logs.length;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};

module.exports = Api;
