const { agents, builds } = require("../utils/agent&buildList");

const registerAgent = async (req, res) => {
  agents.set(req.body.id, req.body);
  res.json({ status: true });
};

const sendResultBuild = async (req, res) => {
  console.log(req.body);
};

module.exports = {
  registerAgent,
  sendResultBuild,
};
