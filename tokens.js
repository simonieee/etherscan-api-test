const {
  getERC20TokenHolding,
  getERC721TokenHolding,
  getERC20TokenTransferEvent,
  getERC721TokenTransferEvent,
} = require("./Api/EtherscanApi");
const _ = require("lodash");
const { getERC20TokenList, getERC721TokenList } = require("./Api/customApi");
const fs = require("fs");
const path = require("path");
const jsonData = require("./data/tokenData.json");

// 동기 지연 함수
const sleep = (ms) => {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
};

const tokenData = async (addr) => {
  // const tokensInfo = await getERC20TokenList(addr);
  const nftInfoList = await getERC721TokenList(addr);
  const tokenList = {
    // erc20: tokensInfo,
    erc721: nftInfoList,
  };
  console.log(tokenList);
  return tokenList;
};

const STORE_URL = __dirname + "/data";

// 수집 전에 수집용 디렉토리 체크 및 생성
const beforeStart = () => {
  const result = fs.existsSync(STORE_URL);
  if (!result) {
    fs.mkdirSync(STORE_URL);
    return;
  }
};

// 파일 경로 만드는 함수
const getStoreUrl = (p) => {
  beforeStart();
  return STORE_URL + "/" + p;
};

// CSV 파일 읽는 함수
const getCsv = (filename) => {
  const csvPath = path.join(__dirname, filename);

  const csv = fs.readFileSync(csvPath, "utf-8");

  const rows = csv.split("\r\n");

  return rows;
};

const addrData = getCsv("address.csv");
const ca = "0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d";
const provider = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

const olddata = require("./data/resultData.json");
const filt = jsonData.filter((i) => i.erc721 !== false);
console.log(filt.length);
const url = getStoreUrl(`token_data.json`);
fs.writeFileSync(url, JSON.stringify(filt, null, 2));

const main = async () => {
  // await Promise.all(
  //   addrData.map(async (addr) => {
  //     await getData(addr, ca, provider);
  //     sleep(1000);
  //   })
  // );
  // await Promise.all(
  //   olddata.map(async (i, idx) => {
  //     console.log("----------------------------------------------");
  //     console.log(`Start address[${idx}]: (${i.wallet_address})`);
  //     console.log("----------------------------------------------");
  //     const data = await tokenData(i.wallet_address);
  //     console.log(data);
  //     jsonData.push(data);
  //     console.log(jsonData);
  //     const url = getStoreUrl(`test.json`);
  //     fs.writeFileSync(url, JSON.stringify(jsonData, null, 2));
  //     console.log("----------------------------------------------");
  //     console.log(`End address[${count}]: (${addrData[count]})`);
  //     console.log("----------------------------------------------");
  //     sleep(500);
  //   })
  // );
  try {
    for (let count = 0; count < 2085; count++) {
      console.log("----------------------------------------------");
      console.log(
        `Start address[${count}]: (${olddata[count].wallet_address})`
      );
      console.log("----------------------------------------------");
      const data = await tokenData(olddata[count].wallet_address);
      console.log("data:", data);
      const newData = {
        ...olddata[count],
        erc721: data.erc721,
      };
      jsonData.push(newData);
      console.log("json:", jsonData);
      const url = getStoreUrl(`tokenData.json`);
      fs.writeFileSync(url, JSON.stringify(jsonData, null, 2));
      console.log("----------------------------------------------");
      console.log(`End address[${count}]: (${addrData[count]})`);
      console.log("----------------------------------------------");
      sleep(500);
    }
  } catch (error) {
    console.log(error);
  }
};

main();
