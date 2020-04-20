const os = require("os");
const { inst } = require("./axios-inst");
const setting = require("../agent-conf.json");

const ip = os.networkInterfaces().lo[0].address;

const registerAgent = async (i = 1) => {
  if (i === 3) {
    console.error("неудалось зарегистрировать сервер");
    return process.exit(1);
  }
  try {
    await inst.post("/notify-agent", {
      id: process.conf.agentId,
      work: false,
      port: setting.port,
      host: ip,
    });

    console.log("Успех, praise the suuuuuuuuuun \\[T]/");
    console.log("Удалось подключится к серверу");
  } catch (error) {
    setTimeout(() => {
      registerAgent(++i);
    }, 2000);
  }
};

module.exports = { registerAgent };
