const express = require("express");
const config = require("./server-conf.json");
const router = require("./router/agent");
const { getConf } = require("./utils/getConf");
const { startCi } = require("./utils/startBuild");

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
// sudo docker run -p 3046:3046 --network=host
