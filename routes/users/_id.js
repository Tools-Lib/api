var express = require('express');
const mysql = require("../../db/connect.js");

var router = express.Router({mergeParams: true});


let badResponse = {status: "fail", body: {errors: [{message: "Invalid UserID"}]}}
let goodResponse = {status: "ok", body: {errors: [], user: {}}}

router.get("/", (req, res) => {
  let id = req.params.id;
  mysql.getUserByUID(id, ["LOWER(username) as username", 'email', 'last_login', 'created_at'])
  .then(rows => {
    goodResponse.body.user = rows[0];
    res.json(goodResponse);
  })
  .catch(err => {
    return res.status(401).json(badResponse);
  });
});

module.exports = router;
