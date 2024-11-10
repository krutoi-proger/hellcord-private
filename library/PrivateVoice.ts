import type { PrivateGroup } from "./PrivateGroup"; // Import the PrivateGroup type from the PrivateGroup module
import { type VoiceChannel } from "discord.js"; // Import the VoiceChannel type from the discord.js library

// Define the VoiceConfig type based on the return type of the saveConfig method from PrivateVoice
export type VoiceConfig = ReturnType<PrivateVoice['saveConfig']>;

export class PrivateVoice {
  work = true; // Flag to indicate if the voice channel is active
  time = 0; // Timer to track inactivity

  // Getter to retrieve the unique ID for the voice channel based on the owner
  get id() {
    return this.group.getId(this.ownerId);
  }

  // Getter to retrieve the owner of the voice channel
  get owner() {
    return this.voice.guild.members.cache.get(this.ownerId);
  }

  // Getter to retrieve the number of members in the voice channel
  get count() {
    return this.voice.members.size;
  }

  // Constructor to initialize the PrivateVoice instance
  constructor(
    public group: PrivateGroup, // Reference to the PrivateGroup this voice channel belongs to
    public voice: VoiceChannel, // The actual VoiceChannel instance
    public ownerId: string, // The ID of the owner of the voice channel
    public deleteTimeout: number // Timeout duration for deleting the channel
  ) { }

  // Method to delete the voice channel
  delete(ignore = false) {
    if (!this.work) return; // If the voice channel is already inactive, do nothing
    this.work = false; // Mark the voice channel as inactive
    this.group.voices.delete(this); // Remove this voice channel from the group's voices
    if (ignore) return; // If ignore is true, skip the deletion of the channel
    this.voice.delete() // Delete the actual voice channel
      .catch(console.log); // Log any errors that occur during deletion
  }

  // Method to save the current configuration of the voice channel
  saveConfig() {
    return {
      name: this.voice.name, // Channel name
      bitrate: this.voice.bitrate, // Bitrate of the channel
      limit: this.voice.userLimit, // User limit for the channel
      region: this.voice.rtcRegion, // RTC region for the channel
      nsfw: this.voice.nsfw, // NSFW flag for the channel
      video: this.voice.videoQualityMode, // Video quality mode for the channel
    };
  }

  // Asynchronous method to manage the voice channel's lifecycle
  async loop() {
    if (!this.work) // If the voice channel is inactive, do nothing
      return;

    // If there is no time recorded and no members, start the timer
    if (!this.time && !this.count)
      this.time = performance.now();
    // If there is a time recorded and there are members, reset the timer
    if (this.time && this.count)
      this.time = 0;

    if (!this.time) // If there is no time recorded, do nothing
      return;

    // Calculate the timeout duration since the last activity
    const timeout = performance.now() - this.time;

    // If the timeout exceeds the delete timeout, delete the voice channel
    if (timeout > this.deleteTimeout) {
      this.delete();
    }
  }
}
