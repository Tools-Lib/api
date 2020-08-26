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
  let db = mysql.makeConnection();
  db.query(`SELECT UID, username, password, token FROM users WHERE username=?`, [username], (err, rows) => {
    if(err) throw err;
    if(!rows || !rows[0] || rows.length < 1) {
      return res.status(400).json(badUsernameResponse);
      db.end();
    } else {
      bcrypt.compare(password, rows[0].password, function(err, result) {
        if(result) {
          goodResponse.body.token = rows[0].token
          res.json(goodResponse);
                                       // console.log(new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth()+1 + "/" + new Date().getDate() + "/" + new Date().getFullYear());
          db.query(`UPDATE users SET last_login='${new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth()+1 + "/" + new Date().getDate() + "/" + new Date().getFullYear()}' WHERE UID=${rows[0].UID}`);
          db.query(`UPDATE users SET ip='${ip}' WHERE UID=${rows[0].UID}`);
          db.end();
        } else {
          return res.status(400).json(badResponse);
          db.end();
        }
      });
    }

  });
});


module.exports = router;
