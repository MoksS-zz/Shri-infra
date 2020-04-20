const { agents } = require("../utils/agent&buildList");
const { inst } = require("../utils/axios-inst");

const registerAgent = async (req, res) => {
  agents.set(req.body.id, req.body);
  res.json({ status: true });
};

const sendResultBuild = async (req, res) => {
  const { body } = req;

  try {
    const agent = agents.get(body.agentId);

    agent.work = false;
    const duration = Date.now() - agent.duration;

    const response = {
      success: body.success,
      duration,
      buildId: body.buildId,
      buildLog: body.buildLog,
    };

    await inst.post("/build/finish", response);

    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.json({ success: false });
  }
};

module.exports = {
  registerAgent,
  sendResultBuild,
};
