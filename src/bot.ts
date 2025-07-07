import * as dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { Address } from 'viem';

import { SeiAgentKit } from './agent/index';
import { analyzeToken, analyzeTokenFromSeiTrace } from './tools/tokenAnalyzer/tokenAnalyzer';
import { reportOnWallet } from './tools/walletReporter/walletReporter';
import { setUserRiskProfile, getUserRiskProfile } from './tools/defi_agent/riskProfileManager';

// ENV Setup
dotenv.config({ override: true });

// Setup Agent + Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const privateKey = process.env.SEI_PRIVATE_KEY;
if (!token || !privateKey) throw new Error("❌ TELEGRAM_BOT_TOKEN and SEI_PRIVATE_KEY are required in .env!");

const agent = new SeiAgentKit(`0x${privateKey}`);
const bot = new TelegramBot(token, { polling: true });

console.log("🔥 SEI-Sage Bot is online and ready to degen!");

// Markdown escape
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~>#+\-=|{}.!]/g, '\\$&');
}

// --- COMMANDS ---

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "gm, ser. SEI-Sage reporting for duty. 🫡\n\nType /help to see what I can do.");
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
Here's what this degen bot can do for you:

/analyze_token [contract_address]  
Get a double-shot alpha: raw data dump and spicy AI analysis.

/recommend_me [wallet_address]  
Get a meme-heavy BUY/SELL/HOLD from your degen AI advisor.

/balance [wallet_address]  
Get your wallet balance and prepare to be roasted.

/set_risk low|medium|high  
Set your risk profile so I know how degenerate you wanna go.

/my_risk  
Check your current risk profile.
  `;
  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

// --- Analyze Token ---
bot.onText(/\/analyze_token (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const contractAddress = match?.[1].trim();

  if (!contractAddress?.startsWith('0x')) {
    bot.sendMessage(chatId, "Wrong format, ser. Gimme the CA. Example: /analyze_token 0x...", { parse_mode: 'Markdown' });
    return;
  }

  try {
    await bot.sendMessage(chatId, "🧪 Pulling raw alpha from my brain... Brace yourself degen.");
    const rawDataReport = await analyzeTokenFromSeiTrace(agent, contractAddress as Address);
    await bot.sendMessage(chatId, escapeMarkdown(rawDataReport), { parse_mode: 'MarkdownV2' });

    await new Promise(res => setTimeout(res, 1000));
    await bot.sendMessage(chatId, "🤖 Crunching degen vibes with my AI brain...");
    const degenAnalysis = await analyzeToken(agent, contractAddress as Address);
    await bot.sendMessage(chatId, escapeMarkdown(`🔥 Giga Radar Analysis\n\n${degenAnalysis}`), { parse_mode: 'MarkdownV2' });

  } catch (err) {
    console.error("Error in /analyze_token:", err);
    bot.sendMessage(chatId, "Sheesh, something went wrong. The chain might be hangover. Try again later.");
  }
});

// --- Wallet Balance ---
bot.onText(/\/balance (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const walletAddress = match?.[1].trim();

  if (!walletAddress?.startsWith('0x')) {
    bot.sendMessage(chatId, "Wrong format, ser. Gimme a wallet address. Example: /balance 0x...", { parse_mode: 'Markdown' });
    return;
  }

  try {
    await bot.sendMessage(chatId, "Aight, checking your wallet... hope you're not broke. 👀");
    const walletReport = await reportOnWallet(agent, walletAddress as Address);
    await bot.sendMessage(chatId, walletReport.header, { parse_mode: 'Markdown' });

    await new Promise(res => setTimeout(res, 1000));
    const roast = await agent.getAiResponse('roast_wallet', walletReport.roastData);
    await bot.sendMessage(chatId, `🔥 *Yapping Time*\n\n${roast}`, { parse_mode: 'Markdown' });

  } catch (err) {
    console.error("Error in /balance:", err);
    bot.sendMessage(chatId, "Sheesh, couldn't check the wallet. You sure that's the right address?");
  }
});

// --- Set Risk ---
bot.onText(/\/set_risk (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const level = match?.[1].toLowerCase().trim();

  if (!['low', 'medium', 'high'].includes(level || '')) {
    bot.sendMessage(chatId, "Invalid risk level. Use: /set_risk low | medium | high");
    return;
  }

  const success = setUserRiskProfile(chatId, level as 'low' | 'medium' | 'high');
  if (success) {
    bot.sendMessage(chatId, `✅ Got it! Your risk level is now set to *${level?.toUpperCase()}*`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, "❌ Couldn't save your risk profile. Please try again.");
  }
});

// --- Get Risk ---
bot.onText(/\/my_risk/, (msg) => {
  const chatId = msg.chat.id;
  const risk = getUserRiskProfile(chatId);

  if (!risk) {
    bot.sendMessage(chatId, "You haven’t set your risk level yet. Use /set_risk low|medium|high", { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `🎯 Your current risk profile is *${risk.toUpperCase()}*`, { parse_mode: 'Markdown' });
  }
});

// --- Recommend Me (with Dexscreener Enhancement) ---
bot.onText(/\/recommend_me (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const walletAddress = match?.[1].trim();

  if (!walletAddress?.startsWith('0x')) {
    bot.sendMessage(chatId, "Invalid wallet address format. Use: /recommend_me 0x...", { parse_mode: 'Markdown' });
    return;
  }

  try {
    await bot.sendMessage(chatId, "🔍 Scanning your wallet... let's see what kind of degen you are.");
    const walletReport = await reportOnWallet(agent, walletAddress as Address);

    const parsedHoldings = walletReport?.header
      ?.split('\n')
      ?.filter(line =>
        line.trim().startsWith('-') &&
        !line.includes('*Estimated Total Value:*')
      ) || [];

    if (parsedHoldings.length === 0) {
      console.warn("⚠️ Parsed holdings kosong, raw header:", walletReport?.header);
      await bot.sendMessage(chatId, "💀 That wallet's empty, ser. Try again when you hold something.");
      return;
    }

    // Update tokens with $0.00 price using Dexscreener
    const updatedHoldings: string[] = [];
    for (const line of parsedHoldings) {
      const match = line.match(/- ([\d.]+) \*(.+?)\* \(\$([\d.]+)\)/);
      if (match) {
        const [, amount, symbol, priceStr] = match;
        if (priceStr === '0.00') {
          const dexData = await agent.fetchDexscreenerData(walletAddress as Address);
          const realPrice = parseFloat(dexData.price);
          const total = (parseFloat(amount) * realPrice).toFixed(2);
          const displayPrice = realPrice.toFixed(8);
          updatedHoldings.push(`- ${amount} *${symbol}* ($${total}) | Dexscreener price: $${displayPrice}`);
        } else {
          updatedHoldings.push(line);
        }
      } else {
        updatedHoldings.push(line);
      }
    }

    const holdingsText = updatedHoldings.join('\n');
    const risk = getUserRiskProfile(chatId) || 'medium';

    const aiPrompt = `
You are a sarcastic, meme-heavy DeFi analyst. A user asked you to analyze their wallet and give a recommendation for each token they hold.

Here is the wallet holding data:
${holdingsText}

Their risk profile is: ${risk.toUpperCase()}.

Give BUY / SELL / HOLD advice for each token with brief, entertaining, shitpost-style remarks. Be helpful, don't list raw data again. Stay spicy.
    `;

    await bot.sendMessage(chatId, "🧠 Cooking up your meme-heavy alpha...");
    const aiReply = await agent.getAiResponse('degen_wallet_recommendation', { prompt: aiPrompt });

    await bot.sendMessage(chatId, `📊 *AI Portfolio Breakdown*\n\n${aiReply}`, {
      parse_mode: 'Markdown',
    });

  } catch (err) {
    console.error("Recommendation error:", err);
    await bot.sendMessage(chatId, "❌ Failed to scan that wallet. Check the address or try again later.");
  }
});
