import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: false,
      ignore: 'pid,hostname,time,level',
      messageFormat: '{msg}',
      singleLine: true
    }
  }
});

export default logger;
