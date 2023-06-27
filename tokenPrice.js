const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const jsonData = require("./data/test.json");
const atoken = require("./data/a.json");
const axios = require("axios");

const tokenPrice = async (token) => {
  const price =
    await axios.get`https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`();
  return price;
};

// 동기 지연 함수
const sleep = (ms) => {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
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

const main = async () => {
  let tokenSymbols = [];
  let withdrawValue = 0;
  let withdrawCount = 0;
  let receiveValue = 0;
  let receiveCount = 0;
  let activityTime = 0;
  const tokenListByAddress = await Promise.all(
    jsonData.map(async (i) => {
      i.erc721 &&
        i.erc721.map((item) => {
          withdrawValue += item.withdrawValue;
          withdrawCount += item.withdrawCount;
          receiveValue += item.receiveValue;
          receiveCount += item.receiveCount;
          activityTime =
            activityTime < item.activityTime ? item.activityTime : activityTime;
        });
      const init = {
        holdingTokens: i.erc721.length,
        withdrawCount: withdrawCount,
        receiveCount: receiveCount,
        activityTime: activityTime,
      };
      return { ...i, erc721: init };
    })
  );
  console.log(tokenListByAddress);

  const url = getStoreUrl(`test2.json`);
  fs.writeFileSync(url, JSON.stringify(tokenListByAddress, null, 2));
};

main();
