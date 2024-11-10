// Import the necessary classes from the discord.js library
import { Client, GatewayIntentBits } from "discord.js";

// Import environment variables from a separate file
import env from "./env";

// Create a new instance of the Client class, which represents the Discord bot
export const bot = new Client({
  // Specify the intents that the bot will use to receive events from Discord
  intents: [
    // Enable the bot to receive events related to guilds (servers)
    GatewayIntentBits.Guilds,
    // Enable the bot to receive updates about voice state changes in guilds
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// Log the bot in using the token from the environment variables
await bot.login(env.); // Note: You need to provide the token here, e.g., env.TOKEN
