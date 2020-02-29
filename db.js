let mongoose = require("mongoose");

const url =
  "mongodb+srv://ultrascheduler:kAtwdqi3Ehd)H@cluster0-fy2jk.mongodb.net/ultrascheduler?retryWrites=true&w=majority";

mongoose.connect(url);

mongoose.connection.on("connected", function() {
  console.log("Mongoose connected to " + url);
});