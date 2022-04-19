
import { LOG_FILTERS } from "./config";
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

/**
 * Enum for the log level
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  ERROR = "ERROR",
  INFO = "INFO"
}

/**
 * In-house logger since Typescript
 * doesn't like console.log()
 * @param {string} message - message to write
 * @param {LogLevel} level - level types to filter by
 */
export const log = async (message: string, level: LogLevel): Promise<void> => {
  LOG_FILTERS.forEach((filter: LogLevel) => {
    if (filter === level) {
      const DATE: string = new Date().toISOString();
      const LOG_STRING = `[${level}]\t${DATE} => ${message}`;
      const CHILD_LOG: ChildProcessWithoutNullStreams = spawn("echo", [
        `${LOG_STRING}`,
      ]);
      CHILD_LOG.stdout.pipe(process.stdout);
    }
  });
}
