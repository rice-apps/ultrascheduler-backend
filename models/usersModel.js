var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

const Course = require("../models/coursesModel").course;

var DraftCourseSchema = new Schema({
    visible: { type: Boolean },
    course: { type: Schema.Types.ObjectID, ref: Course }
})

var ScheduleSchema = new Schema({
    term: { type: String },
    courses: [ DraftCourseSchema ]
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