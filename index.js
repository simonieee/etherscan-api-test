// const Web3 = require("web3");
// const rpcEndpoint = `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`;
// const web3 = new Web3(rpcEndpoint);
const _ = require("lodash");
require("dotenv").config();
const contract = require("./Api/contractApi");
const etherscanApi = require("./Api/etherscanApi");
const customApi = require("./Api/customApi");

/**
 * 특정 계정의 온체인 + 오프체인 활동 데이터
 * @param {*} addr
 */
const getData = async (addr, ca, provider) => {
  try {
    const TokenBalance = await customApi.getTotalTokenBalanceByAddress(addr);
    // internal Tx ETH 총합
    const totalInternalValue = await customApi.getTotalInternalTxValue(addr);

    // 지갑 보유 ETH
    const balance = await etherscanApi.getBalance(addr);

    // 해당 계좌에서 출금한 총 ETH량
    const totalWithdraw = await customApi.totalWithdrawBalance(addr);

    // 해당 계좌로 입금된 총 ETH량
    const totalReceive = await customApi.totalBalanceReceive(addr);

    // 입금 - 출금 (트랜잭션을 10000개만 조회하기에 -가될 수 있음)
    const totalInterestEarned = totalReceive.balance - totalWithdraw.balance;
    const aTokenBalance = await contract.getBorrowBalance(addr);
    const activityTime = await customApi.getActivityTime(addr);
    const borrow_count = await contract.getLoanTransactions(addr);
    const repay_count = await contract.getRepayTransactions(addr);
    const onchainActivityTime = await customApi.getOnchainActivityTime(addr);
    const reservesData = await customApi.getReservesScaleData(
      ca,
      provider,
      addr
    );
    const result = {
      wallet_address: addr,
      balance: balance,
      total_withdraw: totalWithdraw.balance,
      withdraw_count: totalWithdraw.count,
      total_receive: totalReceive.balance,
      receive_count: totalReceive.count,
      total_interest_earned: totalInterestEarned,
      total_internal_value: totalInternalValue.balance,
      internal_tx_count: totalInternalValue.count,
      reserves_balance_address: TokenBalance,
      onchain_activity_time: onchainActivityTime,
      defi_data: {
        defi_activity_time: activityTime,
        total_collateral_base:
          aTokenBalance.totalCollateralBase * Math.pow(10, -8),
        total_debt_base: aTokenBalance.totalDebtBase * Math.pow(10, -8),
        available_borrows_base:
          aTokenBalance.availableBorrowsBase * Math.pow(10, -6),
        current_liquidation_threshold: Number(
          aTokenBalance.currentLiquidationThreshold
        ),
        ltv: Number(aTokenBalance.ltv),
        health_factor: Number(aTokenBalance.healthFactor * Math.pow(10, -18)),
        // (Number(
        //   BigInt("0x" + aTokenBalance.healthFactor) /
        //     BigInt("0x10000000000000000")
        // ) /
        //   2 ** 64) *
        // 100,
        borrow_count: borrow_count,
        repay_count: repay_count,
        scaled_AToken_balance: reservesData.scaledATokenBalance,
        scaled_variable_debt: reservesData.scaledVariableDebt,
      },
    };
    console.table({
      wallet_address: "이더리움 지갑 주소",
      balance: "보유하고 있는 ETH 개수",
      total_withdraw: "해당 계좌에서 송금한 총 ETH량",
      withdraw_count: "해당 계좌에서 송금 트랜잭션 발생 수",
      total_receive: "해당 계좌로 입금된 총 ETH량",
      receive_count: "해당 계좌로 입금 트랜잭션 발생 수",
      total_interest_earned: "예금 및 출금 금액(ETH 기준)의 차이",
      total_internal_value: "internal Tx ETH 총합",
      internal_tx_count: "Internal Tx 횟수",
      reserves_balance_address:
        "Aave 프로토콜 내에서 유저가 가지고있는 토큰 종류 및 수량(USDT,USDC를 제외하고 모두 wei단위(소수점 18자리), USD 단위는 달러(소수점 6자리) )",
      onchain_activity_time: "해당 유저의 On-Chain 활동 기간",
      defi_activity_time:
        "해당 유저가 Defi 활동기간(최초 활동 트랜잭션에서 현재 시간까지의 시간)",
      total_collateral_base:
        "유저가 대출을 받을 때 담보로 제공한 자산의 총 가치(총 담보 금액)",
      total_debt_base: "유저가 대출을 받았을 때 상환해야 할 총 금액(총 대출액)",
      available_borrows_base:
        "유저가 현재 대출 가능한 최대 금액(대출 가능 금액)",
      current_liquidation_threshold:
        "일정 수준의 대출 안전성을 보장하기 위해 설정되는 임계치(threshold)",
      ltv: " 대출 상환액 대비 담보 가치 비율",
      health_factor: "대출 상환 능력(1미만은 청산위험)",
      borrow_count: "해당 유저의 대출 횟수",
      repay_count: "해당 유저의 대출상환 횟수",
      scaled_AToken_balance: "해당 유저의 Aave 자산 잔고 총액(ETH)",
      scaled_variable_debt: "해당 유저의 가변 이자율 대출 잔고 총액(USDT)",
    });
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

const main = async () => {
  const addr = "0xca0AAf0E071f31D86812d83716e10eA5D5cfD425";
  const ca = "0x91c0eA31b49B69Ea18607702c5d9aC360bf3dE7d";
  const provider = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

  getData(addr, ca, provider);
};
main();
module.exports = { getData };
