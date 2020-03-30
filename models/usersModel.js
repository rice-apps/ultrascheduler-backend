var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

const Course = require("../models/coursesModel").course;

var ScheduleSchema = new Schema({
    term: { type: String },
    courses: [ {type: Schema.Types.ObjectID, ref: Course } ]
})

var UserSchema = new Schema({
    netid: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    majors: [ { type: String, maxlength: 4 } ],
    schedules: [ ScheduleSchema ],
    token: { type: String }
})

var User = mongoose.model("users", UserSchema);

exports.user = User;