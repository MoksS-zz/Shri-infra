const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

const clone = async (repoName, commitHash) => {
  const buildsDir = path.join(__dirname, "../");

  const cloneCommand = `rm -rf ./builds && git clone https://github.com/${repoName}.git builds && cd builds && git reset --hard ${commitHash}`;
  const options = { cwd: buildsDir, env: { GIT_TERMINAL_PROMPT: "0" } };

  console.log("clone", cloneCommand);

  try {
    const { stdout, stderr } = await execAsync(cloneCommand, options);
    return { code: 0, stdout, stderr };
  } catch (e) {
    return {
      code: e.code,
      stdout: e.stdout,
      stderr: e.stderr ? e.stderr : e.toString(),
    };
  }
};

module.exports = {
  clone,
};
