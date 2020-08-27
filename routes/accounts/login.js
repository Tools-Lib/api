const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const mysql = require("../../db/connect.js")

let badResponse = {status: "fail", body: {errors: [{message: "Invalid login credentials", authenticated: false}]}}
let badUsernameResponse = {status: "fail", body: {errors: [{message: "Invalid Username/email", authenticated: false}]}}
let goodResponse = {status: "ok", body: {errors: [], authinticated: true, token: ""}}

router.post("/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(!username || !password) return res.status(400).json(badResponse);
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  mysql.getUserByUsername(username)
  .then(rows => {
    bcrypt.compare(password, rows[0].password, function(err, result) {
      if(result) {
        goodResponse.body.token = rows[0].token
        res.json(goodResponse);
        mysql.updateUser({last_login: mysql.getDate(), ip}, rows[0].token)
      } else {
        return res.status(400).json(badResponse);
      }
    });
  })
  .catch(err => {
    return res.status(400).json(badUsernameResponse);
  });
});


module.exports = router;
