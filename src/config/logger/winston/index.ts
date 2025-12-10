import winston from 'winston';

export const logger = winston.createLogger({
  levels: {
    error: winston.config.npm.levels.error,
    info: winston.config.npm.levels.info,
    warning: winston.config.npm.levels.warning,
    debug: winston.config.npm.levels.debug,
  },
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
