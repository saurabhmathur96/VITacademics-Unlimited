/**
 * @module routes/assignments
 */
const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const assignments = require(path.join(__dirname, '..', 'scrapers', 'assignment'));
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

const defaultSemester = 'FS';
/**
 * POST /assignments
 *
 * respond with CAL Assignment details for given student
 */
router.post('/', (req, res, next) => {
  const semester = 'FS';
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      const message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      err.status = 400;
      throw err;
    }
    const uri = {
      courses: 'https://vtopbeta.vit.ac.in/vtop/examinations/doDigitalAssignment',
      details: 'https://vtopbeta.vit.ac.in/vtop/examinations/processDigitalAssignment'
    };
    return requests.post(uri.courses, req.cookies, { 'semesterSubId': 'VL2017181' })
      .then(assignments.parseCourses)
      .then(courses => fetchAssignmentDetails(courses, uri.details, req.cookies, assignments.parseDA))
      .then(courses => res.json({ 'courses': courses }))
  })
  .catch(next);
});

function fetchAssignmentDetails(courses, uri, cookies, parseDA){
  return Promise.all(courses.map(course => {
    return requests.post(uri, cookies, {"classId": course.class_number})
      .then(parseDA).then((details) => {
        course.details = details;
        return course;
      });
  }));
}


module.exports = router;
