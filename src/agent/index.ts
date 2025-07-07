import * as dotenv from 'dotenv';
dotenv.config({ override: true });


import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
  Address,
  PrivateKeyAccount
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sei } from 'viem/chains';
import axios from 'axios';


const rpcUrl = process.env.SEI_RPC_URL || 'https://rpc.ankr.com/sei';

export class SeiAgentKit {

  public publicClient: PublicClient;
  public walletClient: WalletClient;
  private account: PrivateKeyAccount;
  private geminiModel: GenerativeModel;

 
  constructor(privateKey: `0x${string}`) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY tidak di-set di file .env");
    }

    console.log(`[AGENT-INIT] Using RPC: ${rpcUrl}`);

    this.account = privateKeyToAccount(privateKey);
    this.publicClient = createPublicClient({ chain: sei, transport: http(rpcUrl) });
    this.walletClient = createWalletClient({ account: this.account, chain: sei, transport: http(rpcUrl) });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  }

  
  async call(abi: any, functionName: string, args: any[], contractAddress: Address) {
    try {
      return await this.publicClient.readContract({ address: contractAddress, abi, functionName, args });
    } catch (error) {
      console.error(`[AGENT-CALL-ERROR] Gagal memanggil '${functionName}' di kontrak ${contractAddress}:`, error);
      throw error;
    }
  }

  async sendTransaction(abi: any, functionName: string, args: any[], contractAddress: Address) {
    try {
      const { request } = await this.publicClient.simulateContract({
        account: this.account,
        address: contractAddress,
        abi,
        functionName,
        args
      });
      return await this.walletClient.writeContract(request);
    } catch (error) {
      console.error(`[AGENT-SEND-ERROR] Gagal mengirim transaksi '${functionName}' ke kontrak ${contractAddress}:`, error);
      throw error;
    }
  }

  async fetchDexscreenerData(tokenAddress: Address) {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
    try {
      const response = await axios.get(url);
      if (!response.data.pairs || response.data.pairs.length === 0) {
        return { price: '0', volume: 0, liquidity: 0 };
      }
      const pair = response.data.pairs[0];
      return {
        price: parseFloat(pair.priceUsd).toFixed(8),
        volume: pair.volume.h24,
        liquidity: pair.liquidity.usd
      };
    } catch (error) {
      return { price: '0', volume: 0, liquidity: 0 };
    }
  }

  
  async getAiResponse(persona: string, data: any): Promise<string> {
    let prompt;

    switch (persona) {
      case 'describe_meme':
        prompt = `
          You are a professional crypto market analyst who got fired for shitposting too much. Your analysis is sharp and based on data, but your delivery is pure degen, heavy on memes and sarcasm.
          Your task is to analyze a memecoin based on the REAL-TIME data provided.
          
          **REAL-TIME DATA:**
          - Token Name: "${data.name}" (${data.symbol})
          - Source: ${data.source}
          - Price USD: $${data.priceUsd}
          - 24h Volume USD: $${data.volume24h}
          - Liquidity USD: $${data.liquidity}
          
          **YOUR TASK:**
          1. Start with a witty, sarcastic, or meme-heavy opening line.
          2. **Analyze the data.** Is the volume high relative to liquidity? 
          3. **Deliver analysis with a degen tone.**
          4. Give a final, sharp, meme-heavy verdict. WAGMI?
        `;
        break;

      case 'roast_wallet':
        prompt = `
          You are SEI-Sage, a degen crypto shitposter AI.
          Your task is to write a short, funny roast based on a user's wallet balance.

          **USER'S WALLET DATA:**
          - Total Value (USD): $${data.totalValueUsd.toFixed(2)}
          - Number of different tokens: ${data.assetCount}
          
          **YOUR TASK:**
          1. Look at the total value.
          2. If value is low (under $1000), roast them for being a pleb.
          3. If value is high (over $10,000), roast them for being a whale.
          4. Keep it short (2-3 sentences). Be witty.
        `;
        break;

      case 'degen_wallet_recommendation':
        prompt = data.prompt;  
        break;

      default:
        return "Error: Persona AI tidak dikenali.";
    }

    try {
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error("[GEMINI-SDK-ERROR] Gagal generate content:", error.message);
      return "Waduh, otak AI gue lagi kena mental bro. Coba lagi nanti.";
    }
  }
}
