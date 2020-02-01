var express = require('express');
var router = express.Router();
var querystring = require('querystring');

// GET courses
router.get('/', function (req, res) {
    // querystring.parse(req.query);
    var subject = req.query.subject;
    var term = req.query.term;
    var ins = req.query.ins;
    res.send(subject);
});

/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.send('respond with a resource');
// });

module.exports = router;



