var express = require('express');
var router = express.Router();

// This will be created when the user logs in
const jwt = require('jsonwebtoken');

var request = require('request');
var xmlParser = require('xml2js').parseString;
var stripPrefix = require('xml2js').processors.stripPrefix;

var User = require('../models/usersModel').user;

let config = {
    CASValidateURL: 'https://idp.rice.edu/idp/profile/cas/serviceValidate',
    thisServiceURL: 'http://localhost:3001/auth',
    secret: 'testsec'
}

const createUser = async (netid) => {
    let createdUser = User.create({
        netid: netid,
    });
    return createdUser;
}

const getOrCreateToken = async (user) => {
    // Verify token
    return jwt.verify(user.token, config.secret, async (err, decoded) => {
        console.log(decoded);
        let token;
        if (err) {
            // Create token
            token = jwt.sign({
                id: user._id,
                netid: user.netid
            }, config.secret, { expiresIn: 129600 });
            
            // Save token with user
            user.token = token;
            await user.save();
        } else {
            token = user.token;
        }
        return token;
    })
}

router.get('/verify', (req, res, next) => {
    // Get token from header
    let token = req.get('X-Token');

    console.log(token);

    return jwt.verify(token, config.secret, async (err, decoded) => {
        if (err) {
            res.json({ success: false, message: "Nope." });
        } else {
            res.json({ success: true, message: "Enter." });
        }
        return;
    })
})

/* GET home page. */
router.get('/login', function(req, res, next) {
    // Fetch ticket securely from custom header
    var ticket = req.get('X-Ticket');

    // Convert to string
    ticket = String(ticket);

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
                console.log(serviceResponse);
                var authSucceded = serviceResponse.authenticationSuccess;
                if (authSucceded) {
                    // see if this netID exists as a user already. if not, create one.
                    // Assume authSucceded.user is the netid
                    console.log(authSucceded);
                    let netid = authSucceded.user;

                    User.findOne({netid: netid}, async function (err, returnedUser) {
                        if (err) return res.status(500);

                        let user;
                        if (!returnedUser) {
                            // Create user
                            user = await createUser(netid);
                        } else {
                            user = returnedUser;
                        }
                        // Check if user has a token; if not, create for them
                        getOrCreateToken(user).then(token => {
                            res.json({ token });
                        })
                    });
                } else if (serviceResponse.authenticationFailure) {
                    console.log("Ticket authentication failed.");
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
