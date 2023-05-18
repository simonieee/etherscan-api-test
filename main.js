const Web3 = require("web3");
require("dotenv").config();

// 사용자의 주소
const userAddress = "0x215462dC79523ac795216e1Baa27586840Fa9382";
// Ethereum 네트워크에 연결
const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
const web3 = new Web3(rpcEndpoint);

console.log(web3.utils.sha3("LoanEvent"));
function sliceAddr(hex) {
  const addr = hex.startsWith("0x") ? hex.slice(2) : hex;
  return addr;
}

// 대출 거래 수를 조회하는 함수
async function getLoanTransactions(addr) {
  // 사용자의 주소로 대출 거래 기록을 조회하기 위한 필터 생성
  const filter = {
    fromBlock: 0, // 블록 번호를 설정하여 필요한 범위 내에서만 조회 가능
    toBlock: "latest", // 최신 블록까지 조회
    address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // 실제 대출 컨트랙트 주소로 대체해야 함
    topics: [
      "0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0",
      null,
      `0x000000000000000000000000${sliceAddr(addr)}`,
    ],
  };

  // 대출 이벤트 로그를 조회하여 거래 수 계산
  const logs = await web3.eth.getPastLogs(filter);
  return logs;
}

// 대출 거래 수 조회
getLoanTransactionCount(userAddress)
  .then((count) => {
    console.log("대출 거래 수:", count);
  })
  .catch((error) => {
    console.error("에러 발생:", error);
  });
