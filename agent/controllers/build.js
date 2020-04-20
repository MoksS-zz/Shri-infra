const git = require("../utils/git");
const { startCommand } = require("../utils/runCommand");
const { inst } = require("../utils/axios-inst");

const retryPost = async (fn, i = 1, ...args) => {
  if (i === 3) {
    console.log("сервер не отвечает");
    process.exit(1);
  }

  console.log("I работает", i);
  try {
    await fn(...args);
  } catch (error) {
    setTimeout(() => retryPost(fn, ++i, ...args), 6000);
  }
};

const build = async (req, res) => {
  console.log(req.body);
  const { body } = req;
  res.json({ status: true });

  let resultBuild;

  try {
    const resultClone = await git.clone(body.repoName, body.commitHash);

    if (resultClone.code !== 0) {
      return await inst.post("/notify-build-result", {
        success: false,
        buildId: body.id,
        agentId: process.conf.agentId,
        buildLog: resultClone.stdout + resultClone.stderr,
      });
    }

    resultBuild = await startCommand(body.command);

    if (resultBuild.code === 0) {
      return inst.post("/notify-build-result", {
        success: true,
        buildId: body.id,
        agentId: process.conf.agentId,
        buildLog: resultBuild.stdout + resultBuild.stderr,
      });
    }
  } catch (error) {
    console.log(error);
  }

  try {
    await inst.post("/notify-build-result", {
      success: false,
      buildId: body.id,
      agentId: process.conf.agentId,
      buildLog: resultBuild.stdout + resultBuild.stderr,
    });
  } catch (error) {
    await retryPost(inst.post, 0, "/notify-build-result", {
      success: false,
      buildId: body.id,
      agentId: process.conf.agentId,
      buildLog: resultBuild.stdout + resultBuild.stderr,
    });
  }
};

module.exports = {
  build,
};
