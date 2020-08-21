const mysql = require('mysql');
const {host, user, password, database} = require('../config/config.json');
const consola = require('consola');
module.exports.makeConnection = () => {

    let con = mysql.createConnection({
    host,
    user,
    password,
    database
  });
  con.on("connect", () => {
    consola.info('['+ new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() +'] [DB]  - [CONNECT]    - [ID: ' + con.threadId + "]");
  })
  con.on("end", () => {
    consola.info('['+ new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth() + "/" + new Date().getDate() + "/" + new Date().getFullYear() +'] [DB]  - [DISCONNECT] - [ID: ' + con.threadId + "]");
  })
   return con;
}
