const winston = require("winston");
require('dotenv').config();

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            level: "debug",
        }),
        new winston.transports.File({
            filename: "../logs/combined.log",
            level: "http",
            maxsize: "5m",
            maxFiles: 5,
            handleExceptions: true,
            colorize: true,
        }),
        new winston.transports.File({
            filename: "../logs/errors.log",
            level: "error",
            maxsize: "5m",
            maxFiles: 5,
            colorize: true,
        }),
    ],
});

process.on('uncaughtException', (ex) => {
    logger.info(ex.message);
    console.log(ex);
    process.exit(1);
});

process.on('unhandledRejection', (ex) => {
    logger.info(ex.message);
    console.log(ex);
    // process.exit(1);
});

// json web token code
if (!process.env.PORT) {
    logger.error("FATAL ERROR: Application port is not defined.");
    process.exit(1);
}

module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.http(message);
    },
};