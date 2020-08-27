const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const mysql = require("../../db/connect.js")

let badResponse = {status: "fail", body: {errors: [{message: "Invalid token"}]}}
let goodResponse = {status: "ok", body: {errors: [], user: {}}}

router.get("/", (req, res) => {
  let token = req.headers["x-accesstoken"];
  mysql.getUserByToken(token, ["LOWER(username) as username", 'email', 'last_login', 'created_at'])
  .then(rows => {
    goodResponse.body.user = rows[0];
    res.json(goodResponse);
  })
  .catch(err => {
    return res.status(401).json(badResponse);
  });
});

module.exports = router;
