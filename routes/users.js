const User = require("../models/usersModel").user;

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/schedules/:s', async (req, res, next) => {
	// Check user
	let { id, netid } = req.user;

	// Get corresponding user object
	let user = await User.findById(id);

	// Send their schedule(s)
	if (req.params.s == "") {
		// Return all
		res.json(user.schedules);
	} else {
		if (req.params.s < user.schedules.length) {
			res.json(user.schedules[req.params.s]);
		} else {
			res.status(400);
		}
	}
});

router.get('/info', async (req, res, next) => {
	// Get id from JWT
	let {id, netid} = req.user;

	// Get corresponding user object
	let user = await User.findById(id);

	// Send it back
	res.json(user);
});

router.put('/logout', async (req, res, next) => {
	// Get id from JWT
	let { id, netid } = req.user;

	// Get corresponding user object
	let user = await User.findById(id);

	// Reset token
	user.token = "";
	await user.save();

	res.status(200);
});

// router.delete('/deleteUser', (req, res, next) => {
// 	// Get id from JWT
// 	let {id, netid} = req.user;

// 	// Remove corresponding user object
// 	User.findByIdAndDelete(id)
// 		.exec((err, removed) => {
// 			res.status(200).send(removed);
// 		});
// });

// router.post('/create', async (req, res, next) => {
//     let user = await User.create({
// 		netid: req.body.netid,
// 		firstName: req.body.firstName,
// 		lastName: req.body.lastName,
// 		majors: req.body.majors,
// 		token: ""
//     });

//   	res.json(user);
// })

module.exports = router;
