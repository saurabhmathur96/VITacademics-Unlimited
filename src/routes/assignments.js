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

const semester = process.env.SEM || 'WS';
const uri = {
    courses: `https://vtop.vit.ac.in/student/marks_da.asp?sem=${semester}`,
    assignments: 'https://vtop.vit.ac.in/student/marks_da_process.asp',
    projects: 'https://vtop.vit.ac.in/student/marks_pjt_process.asp'
};

/**
 * POST /assignments
 *
 * respond with CAL Assignment details for given student
 */
router.post('/', (req, res, next) => {
  requests.get(uri.courses, req.cookies)
    .then(assignments.parseCourses)
    .then(courses => fetchCourseDetails(courses, req.cookies))
    .then(result => res.json({ 'courses': result }))
    .catch(next);
});

function fetchCourseDetails (courses, cookies) {
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
