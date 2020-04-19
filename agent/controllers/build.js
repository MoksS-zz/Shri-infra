const git = require("../utils/git");
const { startCommand } = require("../utils/runCommand");
const { inst } = require("../utils/axios-inst");

const build = async (req, res) => {
  console.log(req.body);
  const { body } = req;
  res.json({ status: true });

  try {
    const resultClone = await git.clone(body.repoName, body.commitHash);

    if (resultClone.code !== 0) {
      return await inst.post({
        success: false,
        buildId: body.id,
        agentId: process.conf.agentId,
        buildLog: resultClone.stdout + resultClone.stderr,
      });
    }

    const resultBuild = await startCommand(body.command);

    if (resultBuild.code === 0) {
      return inst.post("/notify-build-result", {
        success: true,
        buildId: body.id,
        agentId: process.conf.agentId,
        buildLog: resultBuild.stdout + resultBuild.stderr,
      });
    }

    return inst.post("/notify-build-result", {
      success: false,
      buildId: body.id,
      agentId: process.conf.agentId,
      buildLog: resultBuild.stdout + resultBuild.stderr,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  build,
};
