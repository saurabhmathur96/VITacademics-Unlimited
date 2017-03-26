var path = require('path');
var requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
var attendance = require(path.join(__dirname, '..', 'utilities', 'attendance'));
var schedule = require(path.join(__dirname, '..', 'utilities', 'schedule'));
var academic = require(path.join(__dirname, '..', 'utilities', 'academic'));
var express = require('express');
var router = express.Router();


/**
 * POST /refresh
 *
 * respond with (daily, exam) schedule, attendance and marks details
 */

const semester = 'WS';

const uri = {
  attendance: {
    report: `https://vtop.vit.ac.in/student/attn_report.asp?sem=${semester}`,
    details: `https://vtop.vit.ac.in/student/attn_report_details.asp`,
  },
  schedule: {
    timetable: `https://vtop.vit.ac.in/student/course_regular.asp?sem=${semester}`,
    exam: `https://vtop.vit.ac.in/student/exam_schedule.asp?sem=${semester}`,
  },
  marks: `https://vtop.vit.ac.in/student/marks.asp?sem=${semester}`
};
router.post('/', (req, res, next) => {
  var tasks = [
    requests.post(uri.attendance.report, req.cookie).then(attendance.parseReport).then(fetchAttendanceDetails),
    requests.post(uri.schedule.timetable, req.cookie).then(timetable.parseDaily),
    requests.post(uri.schedule.exam, req.cookie).then(timetable.parseExam),
    requests.post(uri.marks, req.cookie).then(academic.parseMarks)
  ];
  Promise.all(tasks)
    .then(results => {
      res.json({
        'attendance': results[0],
        'timetable': results[1],
        'exam_schedule': results[2],
        'marks': results[3]
      })
    }).catch(err => res.status(500).json({ message: 'Error accessing vtop.' }));
});

function fetchAttendanceDetails(courses) {
  Promise.all(courses.map(course =>
    requests.post(uri.attendance.details, req.cookie, {
      sem: course.semester,
      from_date: course.from_date,
      classnbr: course.class_number,
      crscd: course.crscd,
      crstp: course.crstp
    }).then(attendance.parseDetails)
  ));
}

module.exports = router;
