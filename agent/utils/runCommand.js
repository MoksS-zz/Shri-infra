const { exec } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execAsync = promisify(exec);

const startCommand = async (command) => {
  const buildsDir = path.join(__dirname, "../builds");

  const options = { cwd: buildsDir, stdio: "inherit" };

  console.log("start build", command);

  try {
    const { stdout, stderr } = await execAsync(command, options);
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
  startCommand,
};
