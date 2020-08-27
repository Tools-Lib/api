var express = require('express');
const mysql = require("../../db/connect.js");

var router = express.Router({mergeParams: true});


let badResponse = {status: "fail", body: {errors: [{message: "Invalid UserID"}]}}
let goodResponse = {status: "ok", body: {errors: [], user: {}}}

router.get("/", (req, res) => {
  let id = req.params.id;
  let db = mysql.makeConnection();

  db.query("SELECT LOWER(username), email, last_login, created_at FROM users WHERE UID=?", [id], (err, rows) => {
    if(err) throw err;

    if(!rows || !rows[0] || rows.length < 1) {
      db.end();
      return res.status(401).json(badResponse);
    }

    goodResponse.body.user = rows[0];
    res.json(goodResponse);
    db.end();

  });

});

module.exports = router;
