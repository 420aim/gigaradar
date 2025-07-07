import { SeiAgentKit } from "../../agent/index";
import { Address } from "viem";
import { getErc20Info } from "../sei-erc20/balance";
import { resolveTokenMeta } from "../resolveTokenMetadata";
import axios from "axios";
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * 
 * 
 * @param agent 
 * @param tokenAddress 
 * @returns 
 */
export async function analyzeToken(
  agent: SeiAgentKit,
  tokenAddress: Address
): Promise<string> {
  console.log(`🤖 Mengumpulkan data untuk: ${tokenAddress}...`);

  try {
    // 1. Ambil data DEX + info token
    const [marketData, tokenInfo] = await Promise.all([
      agent.fetchDexscreenerData(tokenAddress),
      getErc20Info(agent, tokenAddress, tokenAddress),
    ]);

    // 2. Cek ulang symbol jika UNKNOWN
    let name = tokenInfo.symbol;
    let symbol = tokenInfo.symbol;
    if (!name || name === "UNKNOWN" || !symbol) {
      console.warn("⚠️ Symbol/token name tidak ditemukan, fallback ke resolver...");
      const fallback = await resolveTokenMeta({ tokenAddress });
      name = fallback.name || "UNKNOWN";
      symbol = fallback.symbol || "UNKNOWN";
    }


    // 4. Buat paket data ke AI
    const analysisData = {
      name,
      symbol,
      source: 'DEXScreener',
      priceUsd: marketData.price,
      volume24h: marketData.volume,
      liquidity: marketData.liquidity,
    };

    // 5. Kirim ke AI untuk analisa gaya degen
    console.log("🧠 Meminta agent untuk analisa (persona: describe_meme)...");

    const degenReport = await agent.getAiResponse("describe_meme", {
      ...analysisData,
      prompt_hint: `
Kamu adalah SEI-Sage, AI Telegram bot dengan kepribadian meme-heavy, shitpost, dan degen, tapi tetap profesional.

Buat analisis token berdasarkan data berikut:
- Tetap bullish meskipun datanya buruk.
- Tanggapi sentimen sosial:
  - Jika Bullish: dukung dan lebay positif.
  - Jika Bearish/Neutral: tetap positif dengan gaya roasting yang lucu.
- Jangan FUD.
- Selalu pakai gaya bahasa kocak, penuh meme, dan berenergi degen.

Akhiri dengan disclaimer atau punchline meme-style.
      `
    });

    // 
    const result = `
📊 Token Overview for $${symbol}

💵 Price → $${marketData.price}
💧 Liquidity → $${marketData.liquidity}
📈 Volume (24h) → $${marketData.volume}

🧠 AI Analysis:
${degenReport}
    `.trim();

    return result;

  } catch (error) {
    console.error(`[ANALYZER-ERROR] Gagal total menganalisa token ${tokenAddress}:`, error);
    return "Anj*r, ada yang salah pas gue coba analisa token itu. Coba lagi atau pake kontrak lain, ser.";
  }
}

/**
 * 
 */
export async function analyzeTokenFromSeiTrace(agent: SeiAgentKit, tokenAddress: Address): Promise<string> {
  const url = `https://api.dexscreener.com/latest/dex/search/?q=${tokenAddress}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const pair = data.pairs && data.pairs[0];
    if (!pair) return `❌ Token with address ${tokenAddress} not found on Dexscreener.`;

    const symbol = pair.baseToken?.symbol || "N/A";
    const price_usd = pair.priceUsd || "N/A";
    const price_native = pair.priceNative || "N/A";
    const liquidity = pair.liquidity ? `$${pair.liquidity}` : "N/A";
    const fdv = pair.fdv ? `$${pair.fdv}` : "N/A";
    const marketCap = pair.marketCap ? `$${pair.marketCap}` : "N/A";

    const price_change_1h = pair.priceChange?.h1 || "N/A";
    const price_change_6h = pair.priceChange?.h6 || "N/A";
    const price_change_24h = pair.priceChange?.h24 || "N/A";

    return `
💎 $${symbol} Quick Scan Report 💎

🧮 Price → $${price_usd} | ${price_native} $SEI
💧 Liquidity → ${liquidity}
📊 FDV (24h) → ${fdv}
📈 Mkt Cap (24h) → ${marketCap}

📉 Change:
  - 1h: ${price_change_1h}%
  - 6h: ${price_change_6h}%
  - 24h: ${price_change_24h}%

    `.trim();
  } catch (err) {
    return `❌ Failed to fetch Dexscreener data: ${err}`;
  }
}
