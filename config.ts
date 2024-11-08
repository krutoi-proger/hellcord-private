interface IPrivate {
  guildId: string; // ID сервера
  categoryId: string; // ID категории с приватками
  createVoiceIds: string[]; // ID каналов, откуда создавать приватку
  deleteTimeout: 1500; // Количество миллисекунд перед удалением канала
}

export const PRIVATES: IPrivate[] = [
  {
    guildId: '805944675188867112',
    categoryId: '1276593846419197962',
    createVoiceIds: [
      '1304447989607174196'
    ],
    deleteTimeout: 1500
  }
];