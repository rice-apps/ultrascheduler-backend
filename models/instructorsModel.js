var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

var InstructorSchema = new Schema({
    firstName: String,
    lastName: String
});

var Instructor = mongoose.model("instructors", InstructorSchema);

exports.instructor = Instructor;