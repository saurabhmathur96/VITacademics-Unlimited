const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const attendance = require(path.join(__dirname, '..', 'scrapers', 'attendance'));
const schedule = require(path.join(__dirname, '..', 'scrapers', 'schedule'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const moment = require('moment-timezone');
const Promise = require('bluebird');
const express = require('express');
let router = express.Router();

const authentication = require(path.join(__dirname, '..', 'middleware', 'authentication'));

/**
 * POST /refresh
 *
 * respond with (daily, exam) schedule, attendance and marks details
 */

const semester = 'WS';
const today = moment().tz('Asia/Kolkata').format('DD-MMM-YYYY')

const uri = {
  attendance: {
    report: `https://vtop.vit.ac.in/student/attn_report.asp?sem=${semester}&fmdt=01-Jan-2016&todt=${today}`,
    details: `https://vtop.vit.ac.in/student/attn_report_details.asp`,
  },
  schedule: {
    timetable: `https://vtop.vit.ac.in/student/course_regular.asp?sem=${semester}`,
    exam: `https://vtop.vit.ac.in/student/exam_schedule.asp?sem=${semester}`,
  },
  marks: `https://vtop.vit.ac.in/student/marks.asp?sem=${semester}`
};
router.post('/', (req, res, next) => {
  const fetchAttendanceDetails = (courses) => {
    return Promise.all(courses.map(course => {
      return requests.post(uri.attendance.details, req.cookies, course.form)
        .then(attendance.parseDetails).then((details) => {
          course.details = details;
          return course;
        });
    }));
  }

  const tasks = [
    requests.get(uri.attendance.report, req.cookies).then(attendance.parseReport).then(fetchAttendanceDetails),
    requests.get(uri.schedule.timetable, req.cookies).then(schedule.parseDaily),
    requests.get(uri.schedule.exam, req.cookies).then(schedule.parseExam),
    requests.get(uri.marks, req.cookies).then(academic.parseMarks)
  ];
  Promise.all(tasks)
    .then(results => {
      res.json({
        'attendance': results[0],
        'timetable': results[1],
        'exam_schedule': results[2],
        'marks': results[3]
      })
    }).catch(next);
});



module.exports = router;
