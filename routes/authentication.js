var express = require('express');
var router = express.Router();

var request = require('request');
var xmlParser = require('xml2js').parseString;
var stripPrefix = require('xml2js').processors.stripPrefix;

// var User = require('../models/userModel').user;

let config = {
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://localhost:8080/auth',
}

/* GET home page. */
router.get('/login', function(req, res, next) {

    var ticket = req.query.ticket;

    if (ticket) {
        // validate our ticket against the CAS server
        var url = `${config.CASValidateURL}?ticket=${ticket}&service=${config.thisServiceURL}`;

        request(url, (err, response, body) => {

            if (err) res.status(500).json({ success: false, message: "An error occurred in the request to CAS." });
            // parse the XML.
            // notice the second argument - it's an object of options for the parser, one to strip the namespace
            // prefix off of tags and another to prevent the parser from creating 1-element arrays.
            xmlParser(body, {
                tagNameProcessors: [stripPrefix],
                explicitArray: false
            }, function (err, result) {
                if (err) return res.status(500);
                serviceResponse = result.serviceResponse;
                var authSucceded = serviceResponse.authenticationSuccess;
                if (authSucceded) {
                    // see if this netID exists as a user already. if not, create one.
                    // Assume authSucceded.user is the netid
                    User.findOne({netid: authSucceded.user}, function (err, user) {
                        if (err) return res.status(500);
                        if (!user) {
                            return res.status(500).json({ success: false, message: "User DNE" });
                        }
                        else {
                            // var token = jwt.sign({
                            //     data: authSucceded,
                            //     userID: user._id
                            // }, config.secret);
                            res.sendJSON({
                                user
                            });
                            // sendJSON(res, user._id, authSucceded.user, token);
                        }
                    });
                } else if (serviceResponse.authenticationFailure) {
                    res.status(401).json({success: false, message: 'CAS authentication failed'});
                } else {
                    res.status(500).send();
                }
            })
        });
    } else {
        return res.status(400).json({ success: false, message: "No Ticket Found!" });
    }
});

module.exports = router;
