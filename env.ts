import { cleanEnv, str } from "envalid";

export default cleanEnv(process.env, {
  DISCORD_TOKEN: str() // insert here discord bot token
});
