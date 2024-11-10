import { CategoryChannel, ChannelType, VoiceChannel } from "discord.js"; // Import necessary classes from the discord.js library
import { PrivateGroup, configStore } from "./library/PrivateGroup"; // Import PrivateGroup and configStore from the local library

import { PRIVATES } from "./config"; // Import configuration from the config file
import { bot } from "./bot"; // Import the bot instance

const state = new Set<PrivateGroup>(); // Create a set to store instances of PrivateGroup

// Event that triggers when the bot is ready
bot.on('ready', async () => {
  console.log('Bot starting'); // Log a message indicating the bot is starting
  for (const config of PRIVATES) { // Iterate over each configuration in PRIVATES
    // Get the guild (server) by ID
    const guild = bot.guilds.cache.get(config.guildId);
    if (!guild)
      throw new Error('No find guild'); // If the guild is not found, throw an error

    // Get the root category by ID
    const root = guild.channels.cache.get(config.categoryId);
    if (!root || !(root instanceof CategoryChannel))
      throw new Error('No find category'); // If the category is not found, throw an error

    // Get the channels to create
    const create = config.createVoiceIds.reduce((acc, id) => {
      const channel = guild.channels.cache.get(id);
      if (!channel || !(channel instanceof VoiceChannel))
        return acc; // If the channel is not found or is not a voice channel, skip it
      return [...acc, channel]; // Add the channel to the accumulator
    }, [] as VoiceChannel[]);

    // Create an instance of PrivateGroup with the root category and voice channels
    const group = new PrivateGroup(
      root,
      create,
      config.deleteTimeout
    );

    state.add(group); // Add the group to the state

    // Get all voice channels in the root category
    const channels = guild.channels.cache.filter((channel) => {
      if (channel.parent !== root)
        return false; // Check that the channel belongs to the root category

      if (!(channel instanceof VoiceChannel))
        return false; // Check that the channel is a voice channel

      return true; // Return true if the channel meets the conditions
    });

    // Iterate over all voice channels
    for (const [id, voice] of channels) {
      if (!(voice instanceof VoiceChannel))
        continue; // Skip if it is not a voice channel

      // Find the permissions of the channel owner
      const ownerPerm = voice.permissionOverwrites.cache.find((perm, id) => {
        return perm.allow.has('ManageChannels') && !guild.members.cache.get(id)?.user.bot; // Check if the permission to manage channels exists and the owner is not a bot
      });

      if (!ownerPerm)
        continue; // Skip if permission is not found

      group.addVoice(voice, ownerPerm.id); // Add the voice channel to the group
    }
  }
});

// Event that triggers when a channel is deleted
bot.on('channelDelete', (channel) => {
  if (channel.type !== ChannelType.GuildVoice)
    return; // Check that the deleted channel is a voice channel

  for (const group of state) { // Iterate over all groups
    for (const voice of group.voices) { // Iterate over all voice channels in the group
      if (voice.voice === channel) // If the voice channel matches the deleted one
        voice.delete(true); // Remove it from the group
    }
  }
});

// Event that triggers when a channel is updated
bot.on('channelUpdate', (_, channel) => {
  if (channel.type !== ChannelType.GuildVoice)
    return; // Check that the updated channel is a voice channel

  for (const group of state) { // Iterate over all groups
    for (const voice of group.voices) { // Iterate over all voice channels in the group
      if (voice.voice === channel) { // If the voice channel matches the updated one
        configStore.put(voice.id, voice.saveConfig()); // Save the channel configuration
      }
    }
  }
});

// Create an HTTP server using Bun
Bun.serve({
  port: 3000, // Specify the port for the server
  fetch
});
