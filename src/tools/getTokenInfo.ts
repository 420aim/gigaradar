import Web3 from "web3";

const RPC_URL = process.env.RPC_URL || "https://bsc-dataseed.binance.org/";
const web3 = new Web3(RPC_URL);

const tokenAbi = [
  { constant: true, inputs: [], name: "name", outputs: [{ name: "", type: "string" }], type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" },
  { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function" },
];

export async function getTokenInfo(address: string) {
  const contract = new web3.eth.Contract(tokenAbi as any, address);

  const name = await contract.methods.name().call().catch(() => "UNKNOWN");
  const symbol = await contract.methods.symbol().call().catch(() => "UNKNOWN");
  const decimals = await contract.methods.decimals().call().catch(() => 18);

  return { name, symbol, decimals };
}
