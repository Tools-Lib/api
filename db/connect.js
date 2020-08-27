const mysql = require('mysql');
const {host, user, password, database, table} = require('../config/config.json');
const consola = require('consola');

let date = () => {
  return new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + " " +new Date().getMonth()+1 + "/" + new Date().getDate() + "/" + new Date().getFullYear()
}
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
let makeConnection = () => {

    let con = mysql.createConnection({
    host,
    user,
    password,
    database
  });
  con.on("connect", () => {
    // console.log(con);
    consola.info('['+ date() +'] [DB]  - [CONNECT]    - [ID: ' + con.threadId + "]");
  })
  con.on("end", () => {
    consola.info('['+ date() +'] [DB]  - [DISCONNECT] - [ID: ' + con.threadId + "]");
  })
   return con;
}

module.exports.makeConnection = makeConnection;
module.exports.getDate = date;

module.exports.getAllUsers = (keys=["*"]) => {
  let db = makeConnection();
  return new Promise((resolve, reject) => {
    db.query(`SELECT ${keys.join(", ")} from users`, (err, rows) => {
      if(err) return reject(err);
      if(!rows || !rows[0] || rows.length < 1) {
        db.end();
        return reject(false);
      } else {
        db.end();
        return resolve(rows);
      }
    });
  });
}

module.exports.getUserByUID = (UID, keys=["*"]) => {
  if(!UID || isNaN(UID)) {
    throw new Error("UserID must be Integer");
    return false;
  }
  let db = makeConnection();
  return new Promise((resolve, reject) => {
    db.query(`SELECT ${keys.join(", ")} from users WHERE UID=?`, [UID], (err, rows) => {
      if(err) return reject(err);
      if(!rows || !rows[0] || rows.length < 1) {
        db.end();
        return reject(false);
      } else {
        db.end();
        return resolve(rows);
      }
    });
  });
}

module.exports.getUserByUsername = (token, keys=["*"]) => {
  let db = makeConnection();
  return new Promise((resolve, reject) => {
    db.query(`SELECT ${keys.join(", ")} from users WHERE username=?`, [token], (err, rows) => {
      if(err) return reject(err);
      if(!rows || !rows[0] || rows.length < 1) {
        db.end();
        return reject(false);
      } else {
        db.end();
        return resolve(rows);
      }

    });
  });
}

module.exports.getUserByToken = (token, keys=["*"]) => {
  let db = makeConnection();
  return new Promise((resolve, reject) => {
    db.query(`SELECT ${keys.join(", ")} from users WHERE token=?`, [token], (err, rows) => {
      if(err) return reject(err);
      if(!rows || !rows[0] || rows.length < 1) {
        db.end();
        return reject(false);
      } else {
        db.end();
        return resolve(rows);
      }

    });
  });
}

const checkUserColumn = (col) => {
  let db = makeConnection();
  return new Promise((resolve, reject) => {
    db.query("SHOW COLUMNS FROM `users` LIKE ?", [col], (err, exist) => {
      if(err) return reject(err);
      if(!exist || !exist[0] || exist.length < 1) {
        db.end();
        resolve(false);
        return
      }
      db.end();
      return resolve(true);
    });
  });
}

module.exports.updateUser = async (settings, token) => {
  let db = makeConnection();
  return new Promise(async (resolve, reject) => {
    for(let [key, value] of Object.entries(settings)) {
      if(!await checkUserColumn(key)) {
        return reject("Unknown option "+key);
      } else {
        db.query(`UPDATE users SET ${key}=? WHERE token=?`, [value, token], (err, rows) => {
          if(err) {
            if(err.code == "ER_DUP_ENTRY") {
              db.end();
              reject("This " + key + " is already exist");
              return;
            }
          }
        });
      }
      await sleep(100);
    }
    module.exports.getUserByToken(token, ["LOWER(username) as username", 'email', 'last_login', 'created_at'])
    .then(rows => {
      return resolve(rows[0]);
    })
    .catch(err => {
      return reject(err);
    });
  })
}

module.exports.createUser = (settings) => {
  let {username, password, token, ip, email} = settings;
  let db = makeConnection();
  return new Promise(async (resolve, reject) => {
    db.query(`INSERT INTO users (username, password, token, created_at, last_login, ip, email) VALUES (?, ?, ?, ?, ?, ?, ?)`, [username, password, token, date(), date(), ip, email])
    module.exports.getUserByToken(token, ["token"])
    .then(rows => {
      return resolve(rows[0]);
    })
    .catch(err => {
      return reject(err);
    });
  });
}

module.exports.deleteUser = (token) => {
  let db = makeConnection();
  return new Promise(async (resolve, reject) => {
    module.exports.getUserByToken(token, ["token"])
    .then(rows => {
      db.query(`DELETE FROM users WHERE token=?`, [token]);
      return resolve(true);
    })
    .catch(err => {
      return reject(err);
    });

  });
}
