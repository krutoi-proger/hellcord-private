import { ChannelType, GuildMember, VoiceChannel, type CategoryChannel } from "discord.js"; // Import necessary classes from the discord.js library

import { PrivateVoice, type VoiceConfig } from "./PrivateVoice"; // Import PrivateVoice and VoiceConfig types from the PrivateVoice module
import { open } from "lmdb"; // Import the open function from the lmdb library

// Open a configuration store using LMDB with VoiceConfig as the value type and string as the key type
export const configStore = open<VoiceConfig, string>({
  path: './configs', // Specify the path to the configuration files
  compression: true // Enable compression for the stored data
});

// Define the PrivateGroup class
export class PrivateGroup {
  voices = new Set<PrivateVoice>(); // Create a set to store instances of PrivateVoice

  // Constructor to initialize the PrivateGroup with a root category, voice channels to create, and a delete timeout
  constructor(
    public root: CategoryChannel, // The root category channel
    public create: VoiceChannel[], // An array of voice channels to create
    public deleteTimeout: number, // Timeout duration for deleting channels
  ) { }

  // Method to add a voice channel to the group
  addVoice(voice: VoiceChannel, owner: GuildMember | string) {
    // Create a new PrivateVoice instance
    const newVoice = new PrivateVoice(
      this, // Reference to the current PrivateGroup
      voice, // The voice channel being added
      owner instanceof GuildMember ? owner.id : owner, // Get the owner's ID
      this.deleteTimeout // Pass the delete timeout
    );
    this.voices.add(newVoice); // Add the new voice to the set of voices
    return newVoice; // Return the newly created PrivateVoice instance
  }

  // Method to generate a unique ID for the voice channel based on the owner
  getId(owner: GuildMember | string) {
    if (owner instanceof GuildMember)
      owner = owner.id; // If the owner is a GuildMember, get their ID

    // Return a string that uniquely identifies the voice channel
    return [
      this.root.guild.id, // Guild ID
      this.root.id, // Category ID
      owner // Owner ID
    ].join(':'); // Join the parts with a colon
  }

  // Asynchronous method to manage voice channels
  async loop() {
    // Iterate over each voice channel to create
    for (const create of this.create) {
      // Iterate over each member in the voice channel
      for (const [, member] of create.members) {
        // Try to find an existing voice channel for the member
        let channel = [...this.voices].find(e => e.ownerId === member.id)?.voice ?? await (
          async () => {
            // Get the configuration for the member's voice channel
            const config = configStore.get(this.getId(member));

            // Create a new voice channel with the specified configuration
            const channel = await this.root.guild.channels.create({
              name: config?.name ?? member.displayName ?? member.user.displayName, // Set the channel name
              bitrate: config?.bitrate ?? undefined, // Set the bitrate if specified
              rtcRegion: config?.region ?? undefined, // Set the RTC region if specified
              userLimit: config?.limit ?? undefined, // Set the user limit if specified
              nsfw: config?.nsfw ?? undefined, // Set the NSFW flag if specified
              videoQualityMode: config?.video ?? undefined, // Set the video quality mode if specified
              parent: this.root, // Set the parent category
              type: ChannelType.GuildVoice, // Specify the channel type as a voice channel
            });

            // Create permission overwrites for the member
            await channel.permissionOverwrites.create(
              member, // The member to grant permissions to
              {
                ManageChannels: true, // Allow managing channels
                MoveMembers: true, // Allow moving members
                ManageMessages: true // Allow managing messages
              }
            );
            return channel; // Return the newly created channel
          }
        )();
        await member.voice.setChannel(channel); // Move the member to the newly created channel
        this.addVoice(channel, member); // Add the new voice channel to the group
      }
    }

    // Iterate over all voice channels in the group and call their loop method
    for (const voice of this.voices)
      await voice.loop();
  }
}
