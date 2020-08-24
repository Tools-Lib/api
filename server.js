const express = require('express');
const consola = require("consola");
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet()); // Seurity plugin
app.use(cors()); // CORS
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {status: "fail", body: { errors: [{message: "Please wait few minutes before trying again"}]}}
  })
);

const mysql = require("./db/connect.js");

const port = 8080;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(function timeLog (req, res, next) {
  app.getDate = () => { return new Date() }
  next();
});


app.use(function iper(req, res, next) {
	let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	app.getIP = () => { return ip }
	next()
})

app.use((req, res, next)=> {
    res.header("Access-Control-Allow-Origin", "https://toolslib.co");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Content-Type", "application/json");

    // res.header("", "");
  	consola.info(`[${app.getDate().getHours() + ":" + app.getDate().getMinutes() + ":" + app.getDate().getSeconds() + " " +app.getDate().getMonth() + "/" + app.getDate().getDate() + "/" + app.getDate().getFullYear()}] [${req.method}] - [${app.getIP()}] => [${req.baseUrl + req.path}] `);
    let fullPath = req.baseUrl + req.path;
    let headers = req.headers;
    // if(headers["User-Agent"] == "") return res.status(404).json({status: "fail", body: {errors:[{message: "UA mismatch"}]}})
    if(fullPath == "/") {
      res.redirect("https://toolslib.co");
    } else if(fullPath.includes("/login") || fullPath.includes("/register") || fullPath == "/seed") {
      next()
    } else if(headers["x-accesstoken"]) {
      let db = mysql.makeConnection();

      db.connect();

      db.query(`SELECT username FROM users WHERE token='${headers["x-accesstoken"]}'`, (err, rows) => {
        if (err) throw err;
        if(!rows || !rows[0] || rows.length < 1) {
          res.status(403).json({status: "failed",body: { errors: [{message: "Invaild access token"}]}})
          db.end();
        } else {
          db.end();
          next();
        }
      })


    } else {
      res.status(401).json({status: "failed", body: { errors: [{message: "Missing access token"}]}})
    }


})
app.use("/", require("./routes"));

app.listen(port, () => {
  console.log(`API is listening at ${port}`);
});
