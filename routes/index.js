var express = require('express');
var router = express.Router();
const mysql = require("../db/connect.js");
const { makeToken } = require("../modules/tokenGen");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.get('/', function (req, res) {
  res.status(400).json({status: "failed", body: {errors: [{message: "Can't Access This Page."}],}});
})

router.get("/seed",  (req, res) => {
  let db = mysql.makeConnection();

  db.connect();

  let username = "xRokz";
  let password = "rokz123";
  db.query(`DELETE FROM users WHERE '1'='1'`);
  var token = makeToken();
  bcrypt.hash(password, 10, function(err, hash) {
      db.query(`INSERT INTO users (username, password, token) VALUES ('${username}', '${hash}', '${token}')`, (err, rows) => {
        db.query(`SELECT * FROM users`, (err, rows) => {
          res.send(rows);
          db.end();
        });
      })
  });





});

module.exports = router;
