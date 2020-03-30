var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

const Instructor = require("../models/instructorsModel").instructor;

var ClassSchema = new Schema({
    startTime: String,
    endTime: String, 
    days: [ { type: String, enum: ['M', 'T', 'W', 'R', 'F', 'S', 'U']}]
})

var LabSchema = new Schema({
    startTime: String,
    endTime: String, 
    days: [ { type: String, enum: ['M', 'T', 'W', 'R', 'F', 'S', 'U']}]
})

var SessionSchema = new Schema({
    class: ClassSchema,
    lab: LabSchema,
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