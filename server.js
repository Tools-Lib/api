const express = require('express');
const consola = require("consola");
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

let liste = ["/accounts/login", "/accounts/join", "/users/"]

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
  	consola.info(`[${app.getDate().getHours() + ":" + app.getDate().getMinutes() + ":" + app.getDate().getSeconds() + " " +app.getDate().getMonth()+1 + "/" + app.getDate().getDate() + "/" + app.getDate().getFullYear()}] [${req.method}] - [${app.getIP()}] => [${req.baseUrl + req.path}] `);
    let fullPath = req.baseUrl + req.path;
    let headers = req.headers;
    let regs = new RegExp("[0-9]*")
    if(fullPath == "/") {
      res.redirect("https://toolslib.co");
    } else if(fullPath.includes("/login") || fullPath.includes("/join") || fullPath == "/seed" || fullPath.match(/[0-9]+$/g)) {
      next()
    } else if(headers["x-accesstoken"]) {

      mysql.getUserByToken(headers["x-accesstoken"], ["token"])
      .then(rows => {
        next();
      })
      .catch(err => {
        res.status(403).json({status: "failed",body: { errors: [{message: "Invaild access token"}]}})
      })




    } else {
      res.status(401).json({status: "failed", body: { errors: [{message: "Missing access token"}]}})
    }


})
app.use("/", require("./routes"));

app.listen(port, async () => {
  console.log(`API is listening at ${port}`);
  // let {username, password, token, ip, email} = settings;
  console.log(await mysql.deleteUser("7htmzepajdfgzaxlr4b4e5zmenvaoadac91dws4b"));


});
