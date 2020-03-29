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

router.get('/getInstructor', (req, res, next) => {
    if (!req.query.firstName || !req.query.lastName) {
        res.send("First and last name of professor is required.");
        return;
    }

    let query = {
        "firstName": req.query.firstName,
        "lastName": req.query.lastName
    };

    Instructor.findOne(query)
    .exec((err, instructor) => {
        res.json(instructor);
    });
})

router.get('/getInstructors', (req, res, next) => {
    Instructor.find({})
    .exec((err, instructors) => {
        res.json(instructors);
    });
})

module.exports = router;
