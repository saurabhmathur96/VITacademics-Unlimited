/**
 * @module routes/assignments
 * @deprecated
 */
const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const assignments = require(path.join(__dirname, '..', 'scrapers', 'cal'));
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();



const courseType = {
  'Embedded Theory': 'ETH',
  'Embedded Lab': 'ELA',
  'Lab Only': 'LO',
  'Theory Only': 'TH',
  'Embedded Project': 'EPJ'
}


const defaultSemester = process.env.SEM || 'WS';
const supportedSemesters = [
  "WS", // Winter Semester
  "SS", // Summer Semester
  "IS", // Inter Semester
  "TS", // Tri Semester
  "FS" // Fall Semester
];


/**
 * POST /assignments
 *
 * respond with CAL Assignment details for given student
 */
router.post('/', (req, res, next) => {

  req.checkBody('semester', '`semester` not supported.').optional().isIn(supportedSemesters);
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      const message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      err.status = 400;
      throw err;
    }
    const semester = req.body.semester || defaultSemester;
    const uri = {
      courses: `https://vtop.vit.ac.in/student/marks_da.asp?sem=${semester}`
    };

    return requests.get(uri.courses, req.cookies)
      .then(assignments.parseCourses)
      .then(courses => fetchCourseDetails(courses, semester, req.cookies))
      .then(courses => res.json({ 'courses': courses }))
  })
    .catch(next);
});

function fetchCourseDetails(courses, semester, cookies) {
  const uri = {
    assignments: 'https://vtop.vit.ac.in/student/marks_da_process.asp',
    projects: 'https://vtop.vit.ac.in/student/marks_pjt_process.asp'
  }

  return Promise.all(courses.map(course => {
    const url_fetch = (courseType[course.course_type] === 'EPJ') ? uri.projects : uri.assignments;

    return requests.post(url_fetch, cookies, {
      'sem': semester,
      'classnbr': course.class_number,
      'crscd': course.course_code,
      'crstp': courseType[course.course_type],
      'daprocmd': 'Process'
    })
      .then(assignments.parseAssignments)
      .then(details => {
        course.assignments = details;
        return course;
      });
  }));
}


module.exports = router;
