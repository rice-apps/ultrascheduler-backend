var mongoose = require('mongoose')
    , Schema = mongoose.Schema

require('../db')

var DummySchema = new Schema({
  netid: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  idealHour: Number,
  maxHour: Number,
  totalHours: Number
});

var Dummy = mongoose.model("dummy", DummySchema);

exports.dummy = Dummy;