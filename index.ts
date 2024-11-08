import { CategoryChannel, ChannelType, VoiceChannel } from "discord.js";
import { PrivateGroup, configStore } from "./library/PrivateGroup";

import { PRIVATES } from "./config";
import { bot } from "./bot";

const state = new Set<PrivateGroup>();

bot.on('ready', async () => {
  for (const config of PRIVATES) {
    // Fetch guild
    const guild = bot.guilds.cache.get(config.guildId);
    if (!guild)
      throw new Error('No find guild');

    // Fetch root
    const root = guild.channels.cache.get(config.categoryId);
    if (!root || !(root instanceof CategoryChannel))
      throw new Error('No find category');

    // Fetch create
    const create = config.createVoiceIds.reduce((acc, id) => {
      const channel = guild.channels.cache.get(id);
      if (!channel || !(channel instanceof VoiceChannel))
        return acc;
      return [...acc, channel];
    }, [] as VoiceChannel[]);

    const group = new PrivateGroup(
      root,
      create,
      config.deleteTimeout
    );

    state.add(group);

    const channels = guild.channels.cache.filter((channel) => {
      if (channel.parent !== root)
        return false;

      if (!(channel instanceof VoiceChannel))
        return false;

      return true;
    });

    for (const [id, voice] of channels) {
      if (!(voice instanceof VoiceChannel))
        continue;

      const ownerPerm = voice.permissionOverwrites.cache.find((perm) => {
        return perm.allow.has('ManageChannels');
      });

      if (!ownerPerm)
        continue;

      group.addVoice(voice, ownerPerm.id);
    }
  }
});

bot.on('channelDelete', (channel) => {
  if (channel.type !== ChannelType.GuildVoice)
    return;

  for (const group of state) {
    for (const voice of group.voices) {
      if (voice.voice === channel)
        voice.delete(true);
    }
  }
});

bot.on('channelUpdate', (_, channel) => {
  if (channel.type !== ChannelType.GuildVoice)
    return;

  for (const group of state) {
    for (const voice of group.voices) {
      if (voice.voice === channel) {
        configStore.put(voice.id, voice.saveConfig());
      }
    }
  }
});

Bun.serve({
  port: 3000,
  fetch() {
    return new Response('It`s work1');
  }
});

while (true) {
  for (const group of state)
    await group.loop();

  await new Promise(resolve => setTimeout(resolve, 500));
}
