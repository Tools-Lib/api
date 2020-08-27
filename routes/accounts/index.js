var express = require('express');
var router = express.Router();

router.use("/join", require("./join"));
router.use("/login", require("./login"));
router.use("/edit", require("./edit"));

module.exports = router;
