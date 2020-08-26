var express = require('express');
var router = express.Router();


router.use("/@me", require("./@me"));
router.use("/:id", require("./_id"));

module.exports = router;
