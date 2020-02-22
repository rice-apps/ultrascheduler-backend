const Dummy = require("../models/dummyModel").dummy;

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/schedules/:s', function(req, res, next) {
  res.send(req.params.s);
});
router.get('/info', function(req, res, next) {
  res.send("ok");
});
router.get('/create', (req, res, next) => {
  Dummy.create({
    netid: "wsm3",
    firstName: "Will",
    lastName: "Mundy",
    role: "user",
    idealHour: 6,
    maxHour: 8,
    totalHours: 8
  });

  res.send("Created new user.");
})

module.exports = router;
