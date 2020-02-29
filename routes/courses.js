const Course = require("../models/coursesModel").course;

var express = require("express");
var router = express.Router();

router.post("/create", (req, res, next) => {
  Course.create({
    subject: "LING",
    courseNum: 200,
    sessions: [
      {
        term: "Fall 2019",
        crn: 12345,
        instructors: ["5e5abaa2d4873ee728f7c85e"]
      }
    ]
  });

  res.send("Created new course.");
});

router.get("/getCourse", (req, res, next) => {
  Course.find({ subject: "LING" })
    .populate({ path: "sessions.instructors", select: "lastName" })
    .exec((err, course) => {
      if (err) {
        res.send("ERROR!");
      } else {
        res.json(course);
      }
    });
});

// requires req to specify filters and changes to be made
// req.body.filter is an object
router.put("/update", (req, res, next) => {
  console.log(req.body);
  console.log(req.body.filter);
  Course.updateMany(req.body.filter, req.body.changes, {
    new: true
  }).exec((err, course) => {
    if (err) {
      res.send("ERROR!");
    } else {
      res.json(course);
    }
  });
});

// router.delete("/delete", (req, res, next) => {
//     Course.find({ subject: "COMP" })
//         .populate({ path: "instructors", select: "lastName" })
//         .exec((err, course) => {
//             if (err) {
//                 res.send("ERROR!");
//             } else {
//                 res.json(course);
//             }
//         });
// });

module.exports = router;
