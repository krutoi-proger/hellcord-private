interface IPrivate {
  guildId: string; // Server ID
  categoryId: string; // Category // IDEA:
  createVoiceIds: string[]; // "create channel" channel
  deleteTimeout: 1500; // Time before deleting channel
}

export const PRIVATES: IPrivate[] = [
  {
    guildId: '', // Server ID
    categoryId: '', // Category //
    createVoiceIds: [ ''  ], // "create channel" channel
    deleteTimeout: 1500 // Time before deleting channel
  }
];
