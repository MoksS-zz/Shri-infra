const git = require("../utils/git");
const { runCommand } = require("../utils/runCommand");
const { inst } = require("../utils/axios-inst");

const retryPost = async (fn, i = 1, ...args) => {
  if (i === 3) {
    console.log("сервер не отвечает");
    process.exit(1);
  }

  try {
    await fn(...args);
  } catch (error) {
    setTimeout(() => retryPost(fn, ++i, ...args), 6000);
  }
};

const build = async (req, res) => {
  const { body } = req;
  res.json({ status: true });

  let resultBuild;
  let success = false;

  try {
    resultBuild = await git.clone(body.repoName, body.commitHash);

    if (resultBuild.code !== 0) {
      return await inst.post("/notify-build-result", {
        success,
        buildId: body.id,
        agentId: process.conf.agentId,
        buildLog: resultBuild.stdout + resultBuild.stderr,
      });
    }

    resultBuild = await runCommand(body.command);

    if (resultBuild.code === 0) {
      success = true;
      return inst.post("/notify-build-result", {
        success,
        buildId: body.id,
        agentId: process.conf.agentId,
        buildLog: resultBuild.logs,
      });
    }

    await inst.post("/notify-build-result", {
      success,
      buildId: body.id,
      agentId: process.conf.agentId,
      buildLog: resultBuild.logs,
    });
  } catch (error) {
    console.log(error);
    await retryPost(inst.post, 0, "/notify-build-result", {
      success,
      buildId: body.id,
      agentId: process.conf.agentId,
      buildLog: resultBuild.logs,
    });
  }
};

module.exports = {
  build,
};
