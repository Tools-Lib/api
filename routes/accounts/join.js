var express = require('express');
var router = express.Router();
const mysql = require("../../db/connect.js")
const { makeToken } = require("../../modules/tokenGen");
const util = require('util');
const bcrypt = require('bcrypt');



let goodResponse = {status: "ok", body: { errors: [], authenticated: true, token: ""}}
let badEmailResponse = {status: "fail", body: { errors: [{message: "Invaild Email address"}], authenticated: false}}
let badUsernameResponse = {status: "fail", body: { errors: [{message: "Invaild Username"}], authenticated: false}}
let badPasswordResponse = {status: "fail", body: { errors: [{message: "Invaild Passowrd"}], authenticated: false}}

let usedEmailResponse = {status: "fail", body: { errors: [{message: "This email is already exist"}], authenticated: false}}
let usedUsernameResponse = {status: "fail", body: { errors: [{message: "This username is already exist"}], authenticated: false}}

router.post("/", async (req, res) => {
  let {username, email, password} = req.body;
  let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if(!ValidateEmail(email)) return res.status(406).json(badEmailResponse);
  if(!ValidateUsername(username)) return res.status(406).json(badUsernameResponse);
  if(!ValidatePassword(password)) return res.status(406).json(badPasswordResponse);

  if(await isExist(username, 'username')) return res.status(406).json(usedUsernameResponse);
  if(await isExist(email, 'email')) return res.status(406).json(usedEmailResponse);

  let db = mysql.makeConnection();

  var token = makeToken();
  bcrypt.hash(password, 10, function(err, hash) {
    db.query(`INSERT INTO users (username, password, token, created_at, ip, email, last_login) VALUES ('${username}', '${hash}', '${token}', '${new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth()+1 + "/" + new Date().getDate() + "/" + new Date().getFullYear()}', '${ip}', '${email}', '${new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth()+1 + "/" + new Date().getDate() + "/" + new Date().getFullYear()}')`);
    db.end();
    goodResponse.body.token = token;
    res.json(goodResponse);
  });
});

function ValidateEmail(email) {
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
  {
    return (true)
  }
    return (false)
}

function ValidateUsername(username) {
  let alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789.';
 if (username.length > 1 && username.length < 33)
  {
    username.split("").forEach(char => {
      if(!alphabet.includes(char)) {
        return false;
      }
    });

    return true;
  }
    return false;
}

function ValidatePassword(password) {

	let lowwerLetters = 'abcdefghijklmnopqrstuvwxyz';
  let upperLetters = lowwerLetters.toUpperCase();
  let numbers = '0123456789';
  let symbols = '~`!@#$%^&*()_-+={[}]|:;<,>.?/';
  let alphabet = lowwerLetters + upperLetters + symbols + numbers;
  let lowerRange = 31, upperRange = 126;

  if(password.length < 6 || password.length > 32) return false;

  // 1 Lowercase Charactar

  // let res = 0
  // for (const c of password.split("")) {
  //   if(lowwerLetters.includes(c)) res++;
  // }
  // if(res == 0) return false;
  //

  // 1 Uppercase Charactar
  // res = 0
  // for (const c of password.split("")) {
  //   if(upperLetters.includes(c)) res++;
  // }
  // if(res == 0) return false;
  //

  // 1 Number
  // res = 0
  // for (const c of password.split("")) {
  //   if(numbers.includes(c)) res++;
  // }
  // if(res == 0) return false;
  //
  
  // 1 Symbol
  // res = 0
  // for (const c of password.split("")) {
  //   if(symbols.includes(c)) res++;
  // }
  // if(res == 0) return false;


  for (const c in password.split("")) {
    const asciiCode = password.charCodeAt(c)
    const isCharValid = asciiCode > lowerRange && asciiCode < upperRange
    if(!isCharValid) return false
  }


  return true;
}


function isExist(value, key) {
  let db = mysql.makeConnection();
  let exist = `SELECT * FROM users WHERE ${key}='${value}'`;
  return new Promise((resolve, reject) => {
    db.query(exist, (err, rows) => {
      if(err) return reject(err);
      // console.log(rows.length);
      if(!rows || !rows[0] || rows.length < 1) {
        db.end();
        return resolve(false);
      }
      db.end();
      return resolve(true);
    });
  });
}

module.exports = router;
