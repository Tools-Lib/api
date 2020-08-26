var express = require('express');
var router = express.Router();
const mysql = require("../db/connect.js");
const { makeToken } = require("../modules/tokenGen");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.get('/', function (req, res) {
  res.status(400).json({status: "failed", body: {errors: [{message: "Can't Access This Page."}],}});
})
router.use("/accounts", require("./accounts"))
router.use("/users", require("./users"))

module.exports = router;
