const axios = require("axios");
const { Agent } = require("https");
const config = require("../server-conf.json");

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const inst = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 3000,
  headers: { Authorization: `Bearer ${config.apiToken}` },
  httpsAgent,
});

module.exports.inst = inst;
