const express = require('express');
const consola = require("consola");
const app = express();
const port = 8080;

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
  	consola.info(` [${app.getDate().getHours() + ":" + app.getDate().getMinutes() + ":" + app.getDate().getSeconds() + " " +app.getDate().getMonth() + "/" + app.getDate().getDate() + "/" + app.getDate().getFullYear()}] - [${app.getIP()}] => [${req.method}] [${req.baseUrl + req.path}] `);

    let headers = req.headers;
    console.log(headers);
    if(headers["x-accesstoken"]) {
      next();
    } else {
      res.sendStatus(401);
    }


})
app.use("/", require("./routes"));

app.listen(port, () => {
  console.log(`Example app listening at ${port}`);
});
