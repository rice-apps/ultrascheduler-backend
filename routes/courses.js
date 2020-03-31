const Course = require("../models/coursesModel").course;
const Instructor = require("../models/instructorsModel").instructor;

var express = require("express");
var router = express.Router();

// var Set = require("collections/set");

var BIGJSON = require("../python_scripts/output5.json")

var jsonToSchema = async (jsonObj) => {
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
				// Split course code
				let courseArr = courseCode.split(" ");
				let subject = courseArr[0];
				let courseNum = courseArr[1];
				let foundCourse = await Course.findOne({ "subject": subject, "courseNum": courseNum });
				
				let courseObject;
				let newObject;
				if (foundCourse) {
					courseObject = foundCourse;
					newObject = false;
				} else {
					courseObject = {
						subject: subject,
						courseNum: courseNum,
						longTitle: "",
						terms: []
					};
					newObject = true;
				}

				for (let termStr in jsonObj[courseCode]) {
					// Check to see if this term is already inside of the retrieved object
					let foundTerm = false;
					if (!newObject) {
						for (let term of courseObject.terms) {
							if (term["term"] == termStr) {
								// Skip
								foundTerm = true;
							}
						}
					}

					// If the term doesn't already exist, create it
					if (!foundTerm) {
						let termObject = {
							"term": termStr,
							"sessions": []
						};
						let sessions = [];
						// inside each term, we have an array of sessions (individual classes) which we want to extract as session objects
						for (let session of jsonObj[courseCode][termStr]) {
								// 1: we want to find the instructors associated with this session - so we will check our Mongo collection for them and if they are not there, we will create them
								let instructorRefs = [];
								for (let instructor of session.instructors) {
									let nameArr = instructor.split(", ");
									let lastName = nameArr[0];
									let firstName = nameArr[1];
									let foundInstructor = await Instructor.findOne({"firstName": firstName, "lastName": lastName});
									let ref;
									if (foundInstructor) {
										// Instructor exists! Get their ref
										ref = foundInstructor._id;
									} else {
										// Create instructor & get their ID
										foundInstructor = await Instructor.create({"firstName": firstName, "lastName": lastName});
										ref = foundInstructor._id;
									}
									instructorRefs.push(ref);
								}
								// 2: Create session object to be added to this particular course object
								let classObject = {};
								let labObject = {};

								// Create class object
								if (session["class_days"] && session["class_days"].length > 0) {
									classObject = {
										"startTime": session["class_start_time"],
										"endTime": session["class_end_time"],
										"days": session["class_days"]
									};
								}

								// Create lab object
								if (session["lab_days"] && session["lab_days"].length > 0) {
									labObject = {
										"startTime": session["lab_start_time"],
										"endTime": session["lab_end_time"],
										"days": session["lab_days"]
									};
								}
								
								// Add session to sessions for term
								sessions.push({
									"class": classObject,
									"lab": labObject,
									"crn": session.crn,
									"instructors": instructorRefs
								});
	
								// Check if longTitle has been created so far
								if (courseObject["longTitle"] == "") {
									courseObject["longTitle"] = session.long_title
								}
	
						}
	
						termObject["sessions"] = sessions;
	
						// Add to courseObject
						courseObject.terms.push(termObject);
					}
					
				}
				
				if (newObject) {
					// Add courseObject to Mongo
					Course.create(courseObject);
				} else {
					let query = {"_id": courseObject._id};
					let update = {
						"$set": {
							"terms": courseObject.terms
						}
					};
					await Course.findOneAndUpdate(query, update);
				}

				// break;
				
				if (courseCode == "ANTH 201") {
					break;
				}
		}


}

router.get("/processJSON", async (req, res, next) => {
	for (let termCourses of BIGJSON["data"]) {
		console.log(Object.keys(termCourses).length)
		await jsonToSchema(termCourses);
	}
	res.json("Meme")
});

// router.post("/create", (req, res, next) => {
// 	Course.create({
// 		subject: "LING",
// 		courseNum: 200,
// 		sessions: [
// 			{
// 				term: "Fall 2019",
// 				crn: 12345,
// 				instructors: ["5e5abaa2d4873ee728f7c85e"]
// 			}
// 		]
// 	});

// 	res.json("Created new course.");
// });

router.get("/getSingleCourse", (req, res, next) => {
	let querySubject = req.query.subject;
	let queryCourseCode = req.query.code;
	Course.find({ subject: querySubject.toUpperCase(), courseNum: queryCourseCode })
		.populate({ path: "terms.sessions.instructors" })
		.exec((err, course) => {
			if (err) {
				res.json("ERROR!");
			} else {
				res.json(course);
			}
		});
});

router.get("/getCoursesBySubject", (req, res, next) => {
	let querySubject = req.query.subject;
	Course.find({ subject: querySubject.toUpperCase() })
		.populate({ path: "terms.sessions.instructors" })
		.exec((err, course) => {
			if (err) {
				res.json("ERROR!");
			} else {
				res.json(course);
			}
		});
});

/**
 * Return unique list of all subjects (COMP, APPL, etc)
 */
router.get("/getAllSubjects", (req, res, next) => {
	// Gets all unique values of the subject field
	Course.collection.distinct("subject")
	.then((uniqueSubjects) => {
		// Return the array
		res.json(uniqueSubjects);
	})
});

router.get("/getCoursesByTerm", (req, res, next) => {
	let queryTerm = req.query.term;
	let courses = Course.collection.aggregate([
		{ $match: {"terms.term": queryTerm}},
		{ $project: {
			subject: '$subject',
			courseNum: '$courseNum',
			longTitle: '$longTitle',
			terms: {$filter: {
				input: '$terms',
				as: 'termObject',
				cond: {$eq: ['$$termObject.term', queryTerm]}
			}}
		}}
	]);
	courses.toArray().then(courses => {
		res.json(courses);
	});
});

router.get("/getCoursesByInstructor", async (req, res, next) => {
	let queryInstructorFName = req.query.firstname;
	let queryInstructorLName = req.query.lastname;
	// Find the corresponding instructor 
	let queryInstructor = await Instructor.findOne({ "firstName": queryInstructorFName, "lastName": queryInstructorLName });
	console.log(queryInstructor);
	let courses = Course.collection.aggregate([
		{ $match: {"terms.sessions.instructors": queryInstructor._id } },
		{ $project: {
			subject: '$subject',
			courseNum: '$courseNum',
			longTitle: '$longTitle',
			terms: {$map: {
				input: '$terms',
				as: 'terms',
				in: {
					term: '$$terms.term',
					sessions: {
						$filter: {
							input: {$map: {
								input: '$$terms.sessions',
								as: 'sessions',
								in: {$cond: [
									{$in: [queryInstructor._id, '$$sessions.instructors']},
									{
										_id: "$$sessions._id",
										crn: "$$sessions.crn",
										class: "$$sessions.class",
										lab: "$$sessions.lab",
										instructors: "$$sessions.instructors"
									},
									false
								]}
							}},
							as: 'ssn',
							cond: '$$ssn'
							// input: '$$terms.sessions',
							// as: 's',
							// cond: {
							// 	$ifNull: [
							// 		{
							// 			$filter: {
							// 				input: '$$s.instructors',
							// 				as: 'instructors',
							// 				cond: {$eq: [queryInstructor._id, '$$instructors']}
							// 			}
							// 		},
							// 		false
							// 	]
							// }
						}
					}
				}
				// cond: {$filter: {
				// 	input: '$terms.sessions.instruc'
				// }}
				// as: 'termObject',
				// cond: {$in: [{$toString: queryInstructor._id}, '$terms.sessions.instructor' ] }
				// cond: {$ne: ['$terms.sessions.instructors', []]}
			}
		}}
	}
	]);

	courses.toArray().then(courses => {
		res.json(courses);
	});
	return;

	Course.find({ "terms.sessions.instructors": queryInstructor._id})
		.populate({ path: "terms.sessions.instructors" })
		.exec((err, courses) => {
			if (err) {
				res.json("ERROR!");
			} else {
				// This part is required because we get ALL courses which this prof teaches, BUT it still includes sessions which they do not teach.

				// Iterate thru each course they teach
				for (let course of courses) {
					// Iterate through each term of this course
					for (let term of course["terms"]) {

						// We'll be adding ONLY the sessions which the queried instructor teaches to this array
						let newSessions = [];

						// Iterate through each existing session of the term
						for (let session of term["sessions"]) {
							// Iterate through each instructor object of the session
							for (let instructorObject of session["instructors"]) {
								// Compare the ID of the instructor for this session and the queried instructor ID
								if (String(instructorObject._id) === String(queryInstructor._id)) {
									// If they match, add this session to the pruned sessions array
									newSessions.push(session);
								}
							}
						}
						
						// Post-pruning, set the sessions array to only those sessions which the queried instructor teaches
						term["sessions"] = newSessions;
					}
				}

				// Return the courses with pruned sessions
				res.json(courses);
			}
		})
});


// requires req to specify filters and changes to be made
// req.body.filter is an object
// router.put("/update", (req, res, next) => {
// 	console.log(req.body);
// 	console.log(req.body.filter);
// 	Course.updateMany(req.body.filter, req.body.changes, {
// 		new: true
// 	}).exec((err, course) => {
// 		if (err) {
// 			res.json("ERROR!");
// 		} else {
// 			res.json(course);
// 		}
// 	});
// });

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
