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
    console.log(userReservesData);
    return userReservesData;
  },
};

module.exports = Api;
