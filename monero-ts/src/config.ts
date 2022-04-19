// global log level (comma separated)
const LOG_LEVEL_ARG: string = process.env.MONERO_TS_LOG_LEVEL;
const IS_MULTI_LOG_LEVEL: boolean =
  LOG_LEVEL_ARG &&
  LOG_LEVEL_ARG.length > 0 &&
  LOG_LEVEL_ARG.indexOf(",") > 0;
const singleLogLevel: string[] = [];
if (!IS_MULTI_LOG_LEVEL && LOG_LEVEL_ARG) {
  singleLogLevel.push(LOG_LEVEL_ARG);
} else {
  // default log level
  singleLogLevel.push("INFO");
  singleLogLevel.push("ERROR");
}
export const LOG_FILTERS: string[] | null = IS_MULTI_LOG_LEVEL
  ? LOG_LEVEL_ARG.split(",")
  : !IS_MULTI_LOG_LEVEL
  ? singleLogLevel
  : null;
export const KECCAK_256 = 'keccak256';
export const KEY_SIZE = 32;
