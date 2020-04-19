const express = require("express");
const config = require("./agent-conf.json");
const router = require("./router/build");
const { registerAgent } = require("./utils/registeration");

process.conf = {
  agentId: `${process.pid}${Date.now()}`,
};

const app = express();

app.use(express.json());
app.use(router);

app.listen(config.port, async (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("agent listen port", config.port);

  const result = await registerAgent();
  if (result.status) {
    console.log("Агент зарегестрирован");
  } else {
    console.error("неудача сервер не зарегистрирован");
    // оставил это для будуще, вдруг какие то исключения приходить будут и как то их обробатывать
    process.exit(1);
  }
});
