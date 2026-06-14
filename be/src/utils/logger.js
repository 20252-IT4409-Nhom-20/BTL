const pino = require("pino");
const isTest = process.env.NODE_ENV === "test";

const options = {
  level: isTest ? "silent" : process.env.LOG_LEVEL || "info",
};

if (!isTest) {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: false, // Render strips ANSI codes anyway
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

module.exports = pino(options);
