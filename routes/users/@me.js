const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const mysql = require("../../db/connect.js")

let badResponse = {status: "fail", body: {errors: [{message: "Invalid token"}]}}
let goodResponse = {status: "ok", body: {errors: [], user: {}}}

router.get("/", (req, res) => {

  let db = mysql.makeConnection();
  let token = req.headers["x-accesstoken"]
  db.query("SELECT username, email, last_login, created_at FROM users WHERE token=?", [token], (err, rows) => {
    if(err) throw err;

    if(!rows || !rows[0] || rows.length < 1) return res.status(401).json(badResponse);

    goodResponse.body.user = rows[0];
    res.json(goodResponse);
    db.end();
  });
});

module.exports = router;
