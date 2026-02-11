var express = require('express');
var router = express.Router();

var rooms = ['devops', 'cloud computing', 'covid19', 'sports', 'nodeJS', 'general', 'web development', 'database'];

router.get('/', function(req, res) {
  res.json({ success: true, rooms: rooms });
});

module.exports = { router: router };
