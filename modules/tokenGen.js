const mysql = require("../db/connect.js");
const rand=()=>Math.random(0).toString(36).substr(2);
const tokenGen=(length)=>(rand()+rand()+rand()+rand()).substr(0,length);

const makeToken = () => {
  let token = tokenGen(40);
  let db = mysql.makeConnection();
  db.query(`SELECT * FROM users where token='${token}'`, (err, rows) => {
    if(!rows || !rows[0] || rows.length < 1) return token;
    else makeToken();
  });
  return token
}

module.exports.makeToken = makeToken;
