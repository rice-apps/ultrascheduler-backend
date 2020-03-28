var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

const Instructor = require("../models/instructorsModel").instructor;

var SessionSchema = new Schema({
    // startTime: Number,
    // endTime: Number, 
    crn: Number, 
    instructors: [{type: Schema.Types.ObjectID, ref: Instructor}]
})

var TermSchema = new Schema({
    term: String,
    sessions: [ SessionSchema ]
})

var CourseSchema = new Schema({
    subject: String,
    courseNum: Number,
    longTitle: String,
    terms: [ TermSchema ],
});

var Course = mongoose.model("courses", CourseSchema);

exports.course = Course;