const User = require("../models/usersModel").user;

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/schedules/:s', function(req, res, next) {
  res.send(req.params.s);
});

router.get('/info', function(req, res, next) {
  res.send("ok");
});

router.get('/findUser', async (req, res, next) => {
	let user = await User.findOne({ "netid": req.query.netid });
	res.json(user);
})

router.post('/create', async (req, res, next) => {
    let user = await User.create({
		netid: req.body.netid,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		majors: req.body.majors
    });

  	res.json(user);
})

module.exports = router;
