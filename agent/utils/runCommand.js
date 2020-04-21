const { spawn } = require("child_process");
const path = require("path");

const runCommand = (cmd) => {
  console.log("start build command =====> \n", cmd);

  return new Promise((resolve) => {
    const cwd = path.join(__dirname, "../builds");
    let logs = "";

    const child = spawn(cmd, [], {
      cwd,
      shell: true,
      stdio: "pipe",
      env: { FORCE_COLOR: 3, ...process.env },
    });

    child.stderr.on("data", (data) => {
      logs += data.toString();
    });
    child.stdout.on("data", (data) => {
      logs += data.toString();
    });
    child.on("exit", (exitCode) => {
      if (exitCode === 0) {
        return resolve({ logs, code: 0 });
      }
      return resolve({ logs, code: exitCode });
    });
  });
};

module.exports = {
  runCommand,
};
