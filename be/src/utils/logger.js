const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const options = {
    level: isTest ? 'silent' : process.env.LOG_LEVEL || 'info',
};

if (!isProduction && !isTest) {
    options.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    };
}

module.exports = pino(options);
