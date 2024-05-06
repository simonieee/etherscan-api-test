const Web3 = require("web3");
require("dotenv").config();
const { abi: lendingPoolAbi } = require("./Abi/lendingPoolABI.json");
const { abi: aTokenAbi } = require("./Abi/USDCTokenABI.json");
const { abi: poolAbi } = require("./Abi/poolABI.json");
// 이더리움 RPC endpoint 주소 설정
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
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

// aToken 잔액 및 이름 가져오기
async function getATokenBalance(abi, address, ca) {
  const aTokenContract = new web3.eth.Contract(abi, ca);
  const tokenName = await aTokenContract.methods.symbol().call();
  const aTokenBalance = await aTokenContract.methods.balanceOf(address).call();
  const tokenInfo = {
    name: tokenName,
    balance: aTokenBalance,
  };

  return tokenInfo;
}
// 대출 잔액 가져오기
async function getBorrowBalance(address) {
  const lendingPoolContract = await getLendingPoolContract();
  const borrowBalance = await lendingPoolContract.methods
    .getUserAccountData(address)
    .call();
  return borrowBalance;
}

async function getTokenList() {
  const lendingPoolContract = await getLendingPoolContract();
  const reservesList = await lendingPoolContract.methods
    .getReservesList()
    .call();
  console.log(reservesList);
  return reservesList;
}

async function getUserReservesData(abi, ca, provider, addr) {
  const uiPoolDataContract = new web3.eth.Contract(abi, ca);
  const userReservesData = await uiPoolDataContract.methods
    .getUserReservesData(provider, addr)
    .call();
  console.log(userReservesData);
  return userReservesData;
}

// printAccountBalances();
// getTokenList();
// getATokenBalance(aTokenAbi, accountAddress, aTokenAddress);
module.exports = {
  getBorrowBalance,
  getTokenList,
  getATokenBalance,
  getUserReservesData,
};
