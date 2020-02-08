var express = require('express');
var router = express.Router();
var querystring = require('querystring');
const https = require("https");

var options = new URL("https://courses.rice.edu/admweb/!swkscat.cat?format=XML&p_action=query&p_term=201910")

// GET courses
router.get('/', function (req, res) {
    // querystring.parse(req.query);
    var subject = req.query.subject;
    var term = req.query.term;
    var ins = req.query.ins;
    res.send(subject);
});

router.get('/fetch', (req, res) => {
    console.log("Fetch!");
    const request = https.request(options, (response) => {
        console.log("Reached inside");
        res.on('data', (d) => console.log(d));
    });

    res.send("Fetched.");
})

/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.send('respond with a resource');
// });

module.exports = router;



