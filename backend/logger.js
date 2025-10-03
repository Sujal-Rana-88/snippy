const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
  ],
});

module.exports = logger;
