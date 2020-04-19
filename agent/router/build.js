const express = require("express");
const controller = require("../controllers/build");

const router = express.Router();

router.post("/build", controller.build);

module.exports = router;
