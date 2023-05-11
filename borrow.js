const Web3 = require("web3");
require("dotenv").config();
const { abi: lendingPoolAbi } = require("./lendingPoolABI.json");
const { abi: aTokenAbi } = require("./USDCTokenABI.json");
const { abi: poolAbi } = require("./poolABI.json");
// 이더리움 RPC endpoint 주소 설정
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

// 계정 주소와 aToken 주소 설정
const accountAddress = "0x03Be75d5167E50c65BeF13A0d8e5D6Ca26d0f8c7";
const aTokenAddress = "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c";

// aToken 컨트랙트 인스턴스 생성
const aTokenContract = new web3.eth.Contract(aTokenAbi, aTokenAddress);
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

// aToken 잔액 가져오기
async function getATokenBalance() {
  const aTokenBalance = await aTokenContract.methods
    .balanceOf(accountAddress)
    .call();
  return aTokenBalance;
}

// 대출 잔액 가져오기
async function getBorrowBalance(address) {
  const lendingPoolContract = await getLendingPoolContract();
  const borrowBalance = await lendingPoolContract.methods
    .getUserAccountData(address)
    .call();
  return borrowBalance;
}

// 예치금과 대출 잔액 출력
async function printAccountBalances() {
  const borrowBalance = await getBorrowBalance();
  return borrowBalance;
}

module.exports = {
  printAccountBalances,
  getBorrowBalance,
};
