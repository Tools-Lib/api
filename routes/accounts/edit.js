var express = require('express');
var router = express.Router();
let mysql = require("../../db/connect");
const { ValidateEmail, ValidatePassword, ValidateUsername, isExist} = require('./join');
const bcrypt = require('bcrypt');

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
let goodResponse = {status: "ok", body: {errors: [], user: {}}}
let badResponse = {status: "fail", body: {errors: [{message: ""}]}}
let badEmailResponse = {status: "fail", body: { errors: [{message: "Invaild Email address"}]}}
let badUsernameResponse = {status: "fail", body: { errors: [{message: "Invaild Username"}]}}
let badPasswordResponse = {status: "fail", body: { errors: [{message: "Invaild Passowrd"}]}}

let usedEmailResponse = {status: "fail", body: { errors: [{message: "This email is already exist"}]}}
let usedUsernameResponse = {status: "fail", body: { errors: [{message: "This username is already exist"}]}}

router.post("/", async (req, res) => {
  let settings = req.body,
  token = req.headers["x-accesstoken"];
  delete settings['token'];
  delete settings['UID'];
  delete settings['last_login'];
  delete settings['created_at'];
  delete settings['ip'];
  // delete settings[''];

  let db = mysql.makeConnection();

  for(let [key, value] of Object.entries(settings)) {
    if(key == "username") {
      if(!ValidateUsername(value)) return res.status(406).json(badUsernameResponse);
      if(await isExist(value, 'username')) return res.status(406).json(usedUsernameResponse);
    } else if(key == "password") {
      if(!ValidatePassword(value)) return res.status(406).json(badPasswordResponse);
    } else if(key == "email") {
      if(!ValidateEmail(value)) return res.status(406).json(badEmailResponse);
      if(await isExist(value, 'email')) return res.status(406).json(usedEmailResponse);
    }
  }

  db.query("SELECT username, email, last_login, created_at FROM users WHERE token=?", [token], async (err, rows) => {
    if(err) throw err;
    if(!rows || !rows[0] || rows.length < 1) {
      db.end();
      badResponse.body.errors[0].message = "Invaild User";
      res.status(401).json(badResponse);
      return;
    } else {
      let i = 0;
      for(let [key, value] of Object.entries(settings)) {
        i++

          db.query("SHOW COLUMNS FROM `users` LIKE ?", [key], (err, exist) => {
            if(err) throw err;
            if(!exist || !exist[0] || exist.length < 1) {
              db.end();
              badResponse.body.errors[0].message = "Invaild Option " + key;
              res.status(406).json(badResponse);
              return;
            } else {
              if(key == "password") {
                // console.log("yay");
                  bcrypt.hash(value, 10, function(err, hash) {
                    db.query(`UPDATE users SET ${key}=? WHERE token=?`, [hash, token], (err, rows) => {
                      if(err) {
                        if(err.code == "ER_DUP_ENTRY") {
                          db.end();
                          badResponse.body.errors[0].message = "This " + key + " is already exist";
                          res.status(406).json(badResponse);
                          return;
                        }
                      }
                    });
                  });
              } else {
                db.query(`UPDATE users SET ${key}=? WHERE token=?`, [value, token], (err, rows) => {
                  if(err) {
                    if(err.code == "ER_DUP_ENTRY") {
                      db.end();
                      badResponse.body.errors[0].message = "This " + key + " is already exist";
                      res.status(406).json(badResponse);
                      return;
                    }
                  }
                });
              }

            }
          });
await sleep(100);
      }
      db.query("SELECT LOWER(username) as username, email, last_login, created_at FROM users WHERE token=?", [token], (err, user) => {
        db.end();
        // console.log(user);
        goodResponse.body.user = user[0];
        res.send(goodResponse);
      });
    }
  });
  // res.send(settings)
});

module.exports = router;
