import { createPlugin } from "cambrian";
import { getTokenInfo } from "../tools/getTokenInfo";

export default createPlugin({
  name: "token-inspect",
  description: "Get token info like name, symbol, decimals from contract address",
  input: {
    tokenAddress: {
      type: "string",
      description: "Token smart contract address",
    },
  },
  async run({ tokenAddress }) {
    const result = await getTokenInfo(tokenAddress);
    return {
      name: result.name,
      symbol: result.symbol,
      decimals: result.decimals,
    };
  },
});
