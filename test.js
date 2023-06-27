const {
  getERC20TokenHolding,
  getERC721TokenHolding,
  getTokenABI,
  getERC20TokenTransferEvent,
} = require("./Api/EtherscanApi");

const tokenData = async (addr) => {
  const result = await getERC20TokenHolding(addr);
  const nftInfo = await getERC721TokenHolding(addr);
  const tokensInfo = await Promise.all(
    result.map(async (i) => {
      const {
        TokenAddress,
        TokenName,
        TokenSymbol,
        TokenQuantity,
        TokenDivisor,
      } = i;
      const erc20Event = await getERC20TokenTransferEvent(addr, TokenAddress);
      let receiveValue = 0;
      let withdrawValue = 0;
      erc20Event.map((i) => {
        const { to, value, from } = i;
        // 입금
        if (to === addr) {
          receiveValue += value;
          return;
        }
        if (from === addr) {
          withdrawValue += value;
        }
      });
      const tokenInfo = {
        TokenAddress: TokenAddress,
        TokenName: TokenName,
        TokenSymbol: TokenSymbol,
        TokenQuantity: TokenQuantity * Math.pow(10, -TokenDivisor),
        TokenDivisor: TokenDivisor,
        withdrawValue: withdrawValue,
        receiveValue: receiveValue,
      };
      return tokenInfo;
    })
  );
  const tokenList = {
    address: addr,
    erc20: tokensInfo,
    erc721: nftInfo,
  };
  console.log(tokenList);
  return tokenList;
};
const addr = "0x2fa11ef008c4b585ccf0a76861794ac7ae5a3a67";

tokenData(addr);
