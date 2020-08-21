var express = require('express');
var router = express.Router();

// middleware that is specific to this router


// define the home page route
router.get('/', function (req, res) {
  res.sendStatus(400);
})

module.exports = router;