import { Client, GatewayIntentBits } from "discord.js";

import env from "./env";

export const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

await bot.login(env.DISCORD_TOKEN);