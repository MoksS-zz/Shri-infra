const axios = require("axios");
const { Agent } = require("https");
const config = require("../agent-conf.json");

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const inst = axios.create({
  baseURL: `http://${config.serverHost}:${config.serverPort}`,
  timeout: 3000,
  httpsAgent,
});

module.exports.inst = inst;
