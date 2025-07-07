🚀 GigaRadar
The Meme-Heavy AI Copilot for the SEI Ecosystem
Built with 🧩 Cambrian Plugins https://github.com/CambrianAgents/cambrian-plugin

🧠 Overview
GigaRadar is a fully autonomous Telegram bot powered by AI, built to help degen users explore and interact with the SEI blockchain in a smart, sarcastic, and meme-friendly way.
It combines on-chain analytics, live market data, and AI-generated insights — all delivered instantly via Telegram. Whether you're holding meme coins, scanning wallets, or asking for shitpost-style recommendations, GigaRadar got your back.

⚒️ Fork and Run Locally
git clone https://github.com/yourname/gigaradar.git
cd gigaradar
cp .env.example .env   # Fill in your Telegram Bot Token, SEI RPC, and Gemini/OpenAI API Key 
npm install
npx tsx src/bot.ts     # Run the bot

✅ Requires:

Node.js 18+
Telegram Bot Token
SEI RPC 
Gemini/OpenAI API 

🧩 Powered by Cambrian Plugins
GigaRadar is built using the Cambrian Plugin SDK, enabling modular AI agent development. You can extend the bot easily by adding tools under the /tools directory or injecting new commands via /bot.ts.
https://github.com/CambrianAgents/cambrian-plugin

🔥 Custom Tools Added:
Tool	Purpose
tokenAnalyzer	AI analysis of tokens using Dexscreener + on-chain data
walletReporter	Real-time wallet scanner with live price support
riskProfileManager	Stores user risk profile (low / medium / high)
recommendationEngine	Personalized AI portfolio suggestions
sei-erc20/balance.ts	Fetch wallet token balances & live prices from Dexscreener

These modules work as AI plugins that your bot can call autonomously — thanks to Cambrian flexible agent architecture.

💥 Key Features
/analyze_token [contract_address]
→ On-chain + market analysis
→ AI explains volume, price, and liquidity in degen tone
→ Includes Dexscreener live price feed

/recommend_me [wallet_address]
→ AI scans wallet & gives BUY / SELL / HOLD advice
→ Adjusts tone based on user risk (low / medium / high)
→ Real-time prices for meme tokens (no more $0.00 issues)

/balance [wallet_address]
→ Shows holdings & total value (live)
→ Includes meme-style wallet roast

/set_risk [low|medium|high]
→ AI adapts advice based on your degen level

/my_risk
→ Shows current risk profile

💡 Future Potential
GigaRadar is designed as a modular AI agent. Its core is already integrated with blockchain data, market analytics, and AI language models — making it ready to evolve into a hyper-intelligent co-pilot for SEI and beyond.

🧠 1. DeFi Agent
Unleash alpha with zero friction:

🧪 Liquidity Pool Analysis: Monitor LP ratios, slippage risks, and impermanent loss.
📊 Rug Pull Detection: Use patterns like sudden LP pulls, honeypots, and ownership flags.
🧮 Yield Forecasting: Estimate earnings from staking/farming based on historical APRs.
🤖 Auto-Yield Strategies: Recommend best places to stake/earn based on risk profile.
🔄 Real-Time Wallet Tracking: Alert users when wallets receive tokens or interact with suspicious contracts.

🌐 2. Social Agent
Turn sentiment into signal:
🐋 Whale Watcher: Track top wallets and notify if they ape into tokens.
🐦 Twitter Sentiment Scanner: Analyze real-time sentiment around any token on crypto Twitter.
💬 Auto Reply / Post Generator: Post spicy tweets or meme replies based on on-chain or trending events.
🗳 DAO Proposal Explainer: Summarize voting proposals from DAOs and explain in simple terms.

📜 3. Smart Contract Assistant
Making contracts understandable and interactive:
🧾 Contract Decoder: Explain functions, constructor logic, and storage in human language.
🧠 AI Audit Helper: Spot red flags or centralization in smart contracts.
🛠 Contract Interaction Generator: Create safe call payloads based on what user wants to do.
🚨 Real-Time On-Chain Alerts: Notify users when specific contracts interact with their wallet or tokens.

🎮 4. AI Wallet Companion
A Telegram-native, AI-powered wallet interface:
📥 Transaction Summaries: “You just bought 1.2M $PEPESEI for $340. It better not rug.”
🤝 AI-Coordinated Trades: "Would you like to swap that $BASED for $SEIYAN before it tanks?"
🧾 Spending Reports: “You spent $2,430 on meme coins last week. Consider therapy.”
⚔️ Risk Dashboard: AI rates your exposure, diversification, and leverage.

🧬 5. Cross-Agent Interoperability
Plug GigaRadar into Cambrian’s agent network:
🤝 Collaborate with Other Agents: Let GigaRadar sync with NFT agents, node runners, DAO agents.
🔗 Multi-Agent Coordination: Run workflows like “scan wallet → detect token → post meme → track sentiment.”

These future paths would position GigaRadar not just as a bot — but a decentralized intelligence layer for users navigating the chaos of crypto.

🧑‍💻 Contributing
Want to build on top of GigaRadar?

Fork it, clone it, and add your own tools!
Cambrian Plugins make it dead simple to register new actions, plug in APIs, and connect to other chains.

Directory you’ll want to explore:

/tools           ← Custom plugin logic  
/agent/index.ts  ← Core agent logic (blockchain + AI)  
/bot.ts          ← Telegram interface and command router  

🤖 Built For Degens, By Degens
GigaRadar brings life to your on-chain data. No more boring scanners. No more flat dashboards. This bot gives you real-time analysis wrapped in memes and sarcasm.
Perfect for:
-Meme traders
-On-chain alpha hunters
-DeFi farmers
-AI explorers
-And any SEI user who likes their data spicy 🌶️

⚡ Final Words
Blockchains are fast.
Memes are faster.
GigaRadar is both.

Let your AI degen assistant go brrr.







