const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const attendance = require(path.join(__dirname, '..', 'scrapers', 'cal'));
const moment = require('moment-timezone');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

function courseType(course_string) {
  switch (course_string) {
    case "Embedded Theory":
      return "ETH";
    case "Embedded Lab":
      return "ELA";
    case "Lab Only":
      return "LO";
    case "Theory Only":
      return "TH";
  }
}

/**
 * POST /assignments
 *
 * respond with (daily, exam) schedule, attendance and marks details
 */

const semester = process.env.SEM || 'WS';
const uri = {
  attendance: {
    courses: `https://vtop.vit.ac.in/student/marks_da.asp?sem=${semester}`,
    assignments: 'https://vtop.vit.ac.in/student/marks_da_process.asp',
  }
};

const fetchCourseDetails = (courses, cookies) => {
  return Promise.all(courses.map(course => {
    return requests.post(uri.attendance.assignments, cookies, {
      "sem": semester,
      "classnbr": course.classnbr,
      "crscd": course.code,
      "crstp": courseType(course.type),
      "daprocmd": "Process"
    })
      .then(attendance.parseAssignments).then((details) => {
        course.assignments = details;
        return course;
      });
  }));
};

router.post('/', (req, res, next) => {
  const tasks = [
    requests.get(uri.attendance.courses, req.cookies)
      .then(attendance.parseCourses)
      .then(courses => fetchCourseDetails(courses, req.cookies))
  ];
  Promise.all(tasks)
    .then(results => {
      if (results[0].length === 0) {
        throw new Error('Unable to parse response from vtop.');
      }
      res.json({
        'result': results[0]
      })
    }).catch(next);
});


module.exports = router;
