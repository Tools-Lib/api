const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => {
  res.sendStatus(400);
})

app.listen(port, () => {
  console.log(`Example app listening at ${port}`)
})