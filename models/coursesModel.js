var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

const Instructor = require("../models/instructorsModel").instructor;

var SessionSchema = new Schema({
    // startTime: Number,
    // endTime: Number, 
    term: String,
    crn: Number, 
    instructors: [{type: Schema.Types.ObjectID, ref: Instructor}]
})

var CourseSchema = new Schema({
    subject: String,
    courseNum: Number,
    sessions: [ SessionSchema ],
});

var Course = mongoose.model("courses", CourseSchema);

exports.course = Course;