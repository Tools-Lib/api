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
router.get("/seed",  (req, res) => {
  let db = mysql.makeConnection();
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  db.connect();

  let username = "xRokz";
  let password = "rokz123";
  let email = "rokz@toolslib.co"
  db.query(`DELETE FROM users WHERE '1'='1'`);
  var token = makeToken();
  bcrypt.hash(password, 10, function(err, hash) {
      db.query(`INSERT INTO users (username, password, token, created_at, ip, email) VALUES ('${username}', '${hash}', '${token}', '${new Date()}', '${ip}', '${email}')`, (err, rows) => {
        db.query(`SELECT * FROM users`, (err, rows) => {
          res.send(rows);
          db.end();
        });
      })
  });





});

module.exports = router;
