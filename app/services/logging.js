const winston = require('winston');
const expressWinston = require('express-winston');

module.exports.logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.cli() }),
  ],
});

module.exports.middlewareLogger = expressWinston.logger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({ format: winston.format.cli() }),
    ],
  });
 