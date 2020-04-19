const express = require("express");
const config = require("./server-conf.json");
const router = require("./router/agent");
const { inst } = require("./utils/axios-inst");
const { startCi } = require("./utils/startBuild");

const getConf = async (i = 1) => {
  console.log(i);
  try {
    if (i === 3) {
      console.error("неудалось получить настройки");
      return process.exit(1);
    }

    const result = await inst.get("/conf");
    process.conf = result.data.data || {};
    console.log(process.conf);
  } catch (error) {
    console.log(error);
    getConf(++i);
  }
};

getConf();

const app = express();

app.use(express.json());
app.use(router);

app.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("server listen port", config.port);

  startCi();
});

// setInterval(() => console.log(agents), 2000);
