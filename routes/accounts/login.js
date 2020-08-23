const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const mysql = require("../../db/connect.js")

let badResponse = {status: "fail", body: {errors: [{message: "Invalid login credentials", authenticated: false}]}}
let badUsernameResponse = {status: "fail", body: {errors: [{message: "Invalid Username", authenticated: false}]}}
let goodResponse = {status: "ok", body: {errors: [], authinticated: true}}

router.post("/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password) return res.status(400).json(badResponse);

  let db = mysql.makeConnection();
  db.query(`SELECT username, password FROM users WHERE username='${username}'`, (err, rows) => {
    if(err) throw err;
    if(!rows || !rows[0] || rows.length < 1) {
      return res.status(400).json(badUsernameResponse);
    } else {
      bcrypt.compare(password, rows[0].password, function(err, result) {
        if(result) {
          res.json(goodResponse);
        } else {
          return res.status(400).json(badResponse);
        }
      });
    }
  });
});


module.exports = router;
