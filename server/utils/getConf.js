const { inst } = require("./axios-inst");

const getConf = async (i = 1) => {
  console.log(i);
  try {
    if (i === 3) {
      console.error("неудалось получить настройки");
      return process.exit(1);
    }

    const result = await inst.get("/conf");
    process.conf = result.data.data || {};
    console.log("настройки билда", process.conf);
  } catch (error) {
    console.log(error);
    getConf(++i);
  }
};

module.exports = { getConf };
