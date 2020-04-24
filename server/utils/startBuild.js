const axios = require("axios");
const { inst } = require("./axios-inst");
const { getConf } = require("./getConf");
const { builds, agents } = require("./agent&buildList");

const buildCheck = async (i = 0, limit = 50) => {
  if (i === 3) {
    console.log("bd не работает");
    process.exit(1);
  }
  try {
    const newbuild = await inst.get(`/build/list?limit=${limit}`);
    const buildList = newbuild.data.data.reverse();

    if (
      buildList.length > 0 &&
      buildList[0].configurationId !== process.conf.id
    ) {
      await getConf();
      // так как у нас при смене настроек старые билды в базе удаляются,
      // то и старые билды неактуальные запускать я не буду.
      builds.clear();
    }

    for (const build of buildList) {
      if (!builds.has(build.id) && build.status === "Waiting") {
        builds.set(build.id, build);
      }
    }

    setTimeout(buildCheck, 3000);
  } catch (error) {
    console.log(error);
    setTimeout(() => buildCheck(++i), 30000);
  }
};

const sendBuildAgent = async () => {
  try {
    const freeAgent = [...agents.values()].filter((e) => e.work === false);

    let i = 0;
    // console.log("проверка своодных агентов", freeAgent);
    // console.log("проверка оставшихся билдов", builds);
    for await (const build of builds) {
      if (i >= freeAgent.length) break;
      const agent = freeAgent[i++];

      if (build[1].status === "Waiting") {
        await inst.post("build/start", {
          buildId: build[1].id,
          dateTime: new Date().toISOString(),
        });
        build[1].status = "InProgress";
      }

      let sendBuild;
      try {
        sendBuild = await axios.post(
          `http://${agent.host}:${agent.port}/build`,
          {
            id: build[1].id,
            repoName: process.conf.repoName,
            commitHash: build[1].commitHash,
            branchName: build[1].branchName,
            command: process.conf.buildCommand,
          }
        );
      } catch (error) {
        console.log(error);
        // если сервер упал, то он перезапустится и будет иметь новый id, так что этот не актуальный.
        agents.delete(agent.id);
        return setTimeout(sendBuildAgent, 5000);
      }

      if (sendBuild.data && sendBuild.data.status) {
        builds.delete(build[0]);
        agent.work = true;
        agent.currentBuild = build[1];
        agent.duration = Date.now();
        console.log(agent);
      }
    }

    setTimeout(sendBuildAgent, 5000);
  } catch (error) {
    console.log(error);
    setTimeout(sendBuildAgent, 5000);
  }
};

const removeFallenAgent = () => {
  for (const agent of agents) {
    if (agent[1].work && Date.now() - agent[1].duration > 30000) {
      console.log("Удаление зависших билдов");
      builds.set(agent[1].currentBuild.id, agent[1].currentBuild);
      agents.delete(agent[1].id);
    }
  }
  setTimeout(removeFallenAgent, 6000);
};

const startCi = () => {
  setTimeout(() => buildCheck(0, 100), 3000);
  setTimeout(sendBuildAgent, 5000);
  setTimeout(removeFallenAgent, 6000);
};

module.exports = {
  startCi,
};
