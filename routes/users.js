var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/schedules/:s', function(req, res, next) {
  res.send(req.params.s);
});
router.get('/info', function(req, res, next) {
  res.send("ok");
});

module.exports = router;
