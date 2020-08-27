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

  // let db = mysql.makeConnection();

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
  mysql.updateUser(settings, token)
  .then(user => {
    res.json(user);
  })
  .catch(err => {
    res.status(400).json(err);
  })

});

module.exports = router;
