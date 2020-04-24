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

    const timer = setTimeout(() => {
      const test = /[^.\s]/.test(logs);
      if (!test) {
        logs = `Таймер истек, сборка не выполнилась \n логи не были получены`;
      } else {
        logs += `\n Таймер истек, сборка не выполнилась`;
      }
      console.log("kill child process");
      child.kill();
      return resolve({ logs, code: 1 });
    }, 15000);

    child.stderr.on("data", (data) => {
      logs += data.toString();
    });
    child.stdout.on("data", (data) => {
      logs += data.toString();
    });
    child.on("exit", (exitCode) => {
      const test = /[^.\s]/.test(logs);
      if (exitCode === 0) {
        if (!test) {
          logs = "Сборка прошла успешно, логи не были получены";
        }
        clearTimeout(timer);
        return resolve({ logs, code: 0 });
      }
      if (!test) {
        logs = `Что то пошло не так, код ошибки: ${exitCode} \n логи не были получены`;
      }
      clearTimeout(timer);
      return resolve({ logs, code: exitCode });
    });

    child.on("error", (code, signal) => {
      console.log(`child process killed code: ${code}, signal: ${signal}`);
    });
  });
};

module.exports = {
  runCommand,
};
