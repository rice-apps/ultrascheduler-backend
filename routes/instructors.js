const Instructor = require("../models/instructorsModel").instructor;

var express = require('express');
var router = express.Router();

router.post('/create', (req, res, next) => {
    Instructor.create({
        firstName: "Dan",
        lastName: "Wallach"
    });

    res.send("Created new instructor.");
})

module.exports = router;
