const Course = require("../models/coursesModel").course;

var express = require("express");
var router = express.Router();


var BIGJSON = require("../python_scripts/output1.json")

var jsonToSchema = (jsonObj) => {
    // for course name in json 
    //     //create course schema
    //     for term  
    //         for session in term 
    //             add a session schema thing to the Array

    //    return asfc 101 Object

    // https://stackoverflow.com/questions/40102372/find-one-or-create-with-mongoose 

    // Iterate through each course code in the json
    for (let courseCode in jsonObj) {
        // create course object for this key
        // inside each course code, we want to extract each term
        for (let term in jsonObj[courseCode]) {
            // inside each term, we have an array of sessions (individual classes) which we want to extract as session objects
            for (let session of jsonObj[courseCode][term]) {
                // 1: we want to find the instructors associated with this session - so we will check our Mongo collection for them and if they are not there, we will create them
                // 2: Create session object to be added to this particular course object
                var tempObj = {
                    term: String,
                    crn: Number,
                    instructors: [{ type: Schema.Types.ObjectID, ref: Instructor }]
                }
            }
        }
    }


}

router.get("/processJSON", (req, res, next) => {
    jsonToSchema(BIGJSON);
});

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
