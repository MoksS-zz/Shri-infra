const axios = require("axios");
const { inst } = require("./axios-inst");
const { builds, agents } = require("./agent&buildList");

const buildCheck = async (i = 0) => {
  if (i === 3) {
    console.log("bd не работает");
    process.exit(1);
  }
  try {
    const newbuild = await inst.get("/build/list");
    const buildList = newbuild.data.data;

    for (const build of buildList) {
      if (!builds.has(build.id) && build.start === undefined) {
        builds.set(build.id, build);
      }
    }

    setTimeout(buildCheck, 3000);
  } catch (error) {
    console.log(error);
    setTimeout(() => buildCheck(++i), 10000);
  }
};

const sendBuildAgent = async () => {
  try {
    const freeAgent = [...agents.values()].filter((e) => e.work === false);
    let i = 0;
    console.log("проверка своодных агентов", freeAgent);
    for await (const build of builds) {
      if (i >= freeAgent.length) break;
      const agent = freeAgent[i++];

      const sendBuild = await axios.post(
        `http://${agent.host}:${agent.port}/build`,
        {
          id: build[1].id,
          gitUrl: `https://github.com/${process.conf.repoName}.git`,
          commitHash: build[1].commitHash,
          branchName: build[1].branchName,
          buildCommand: process.conf.buildCommand,
        }
      );

      if (sendBuild.data && sendBuild.data.status) {
        const res = inst.post({
          buildId: build[1].id,
          dateTime: new Date().toISOString(),
        });

        // builds.delete(build[0]);
        // agent.work = true;
      }
    }

    setTimeout(sendBuildAgent, 5000);
  } catch (error) {
    console.log(error);
  }
};

const startCi = () => {
  setTimeout(buildCheck, 3000);
  setTimeout(sendBuildAgent, 5000);
};

module.exports = {
  startCi,
};
