const Web3 = require("web3");
require("dotenv").config();

// 사용자의 주소
const userAddress = "0x523b27014B865c4d8f3dAC9c6e3B1bAd13D22b87";
// Ethereum 네트워크에 연결
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

console.log(web3.utils.sha3("LoanEvent"));
function sliceAddr(hex) {
  const addr = hex.startsWith("0x") ? hex.slice(2) : hex;
  return addr;
}

const sliceData = (data) => {
  const dataslice = sliceAddr(data);
  const dataSize = Math.ceil(dataslice.length / 4);
  const result = {
    debtToCover: parseInt(dataslice.substring(0, dataSize), 16),
    liquidatedCollateralAmount: parseInt(
      dataslice.substring(dataSize, dataSize * 2),
      16
    ),
    liquidator: dataslice.substring(dataSize * 2, dataSize * 3),
  };
  return result;
};

// // 청산 금액 확인
async function getLiquidationData(addr) {
  // 사용자의 주소로 대출 거래 기록을 조회하기 위한 필터 생성
  const filter = {
    fromBlock: 0, // 블록 번호를 설정하여 필요한 범위 내에서만 조회 가능
    toBlock: "latest", // 최신 블록까지 조회
    address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // 실제 대출 컨트랙트 주소로 대체해야 함
    topics: [
      "0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286",
      null,
      null,
      `0x000000000000000000000000${sliceAddr(addr)}`,
    ],
  };

  // 대출 이벤트 로그를 조회하여 거래 수 계산
  const logs = await web3.eth.getPastLogs(filter);
  const result = logs.map((i) => sliceData(i.data));
  console.log(result);
  return result;
}

const getBlockNum = async (addr) => {
  const latestBlockNum = await web3.eth.getBlockNumber();
  const startBlockNum = latestBlockNum - 10000 + 1;

  for (let start = startBlockNum; start <= latestBlockNum; start++) {
    const blockInfo = await web3.eth.getBlock(start);
    const txHash = await blockInfo.transactions;
    const txInfo = await Promise.all(
      txHash.map(async (i) => await web3.eth.getTransaction(i))
    );
    const myTx = txInfo.filter((i) => i.to === addr);
    console.log(myTx);
  }
};

getBlockNum("0xca0AAf0E071f31D86812d83716e10eA5D5cfD425");
