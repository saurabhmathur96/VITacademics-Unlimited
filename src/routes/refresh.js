/**
 * @module routes/refresh
 */
const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const attendance = require(path.join(__dirname, '..', 'scrapers', 'attendance'));
const schedule = require(path.join(__dirname, '..', 'scrapers', 'schedule'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const home = require(path.join(__dirname, '..', 'scrapers', 'home'));
const notification = require(path.join(__dirname, '..', 'services', 'notification'));
const moment = require('moment-timezone');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const database = require('../services/database');


const defaultSemester = process.env.SEM || 'WS';

/**
 * POST /refresh
 *
 * respond with (daily, exam) schedule, attendance and marks details
 */

router.post('/', (req, res, next) => {
  let fetchData = null;
  const semester = req.body.semester;
  const campus = req.body.campus;
  const today = moment().tz('Asia/Kolkata').format('DD-MMM-YYYY');
  const year = moment().tz('Asia/Kolkata').format('YYYY');

  let courseCollection  = new database.CourseCollection();
  const semId = (semester === 'FS' ? 'VL2017181' : 'VL2017185');
  if (campus === 'vellore') {
    // Use vtopbeta for data
    const uri = {
      schedule: {
        timetable: 'https://vtopbeta.vit.ac.in/vtop/processViewTimeTable',
        exam: 'https://vtopbeta.vit.ac.in/vtop/examinations/doSearchExamScheduleForStudent'
      },
      attendance: {
        report: 'https://vtopbeta.vit.ac.in/vtop/processViewStudentAttendance',
        details: 'https://vtopbeta.vit.ac.in/vtop/processViewAttendanceDetail'
      },
      marks: 'https://vtopbeta.vit.ac.in/vtop/examinations/doStudentMarkView'
    }

    const tasks = [
      requests.post(uri.attendance.report, req.cookies, { 'semesterSubId': semId })
        .then(attendance.parseReportBeta)
        .then(courses => fetchAttendanceDetails(courses, uri.attendance.details, req.cookies, attendance.parseDetailsBeta)),
      requests.post(uri.schedule.timetable, req.cookies, { 'semesterSubId': semId })
        .then(schedule.parseDailyBeta),
      requests.post(uri.schedule.exam, req.cookies, { 'semesterSubId': 'VL2017181' })
        .then(schedule.parseExamBeta),
      requests.post(uri.marks, req.cookies,  {'semesterSubId': 'VL2017181' })
        .then(academic.parseMarksBeta)
        .then(marksReports => updateMarksCollection(courseCollection, marksReports, req.body.reg_no, semester, year))
    ]
    // { 'CAT - I': [], 'CAT - II': [], 'Final Assessment Test': [] }
    fetchData = Promise.all(tasks).then((results) => [results[0], results[1], results[2], results[3]]);
  } else {
    // Use vtop for data
    const baseUri = (campus === 'chennai' ? 'https://academicscc.vit.ac.in/student' : 'https://vtop.vit.ac.in/student');
    const uri = {
      attendance: {
        report: `${baseUri}/attn_report.asp?sem=${semester}&fmdt=01-Jan-2016&todt=${today}`,
        details: `${baseUri}/attn_report_details.asp`,
      },
      schedule: {
        timetable: `${baseUri}/course_regular.asp?sem=${semester}`,
        exam: `${baseUri}/exam_schedule.asp?sem=${semester}`,
      },
      marks: `${baseUri}/marks.asp?sem=${semester}`
    };


    const tasks = [
      requests.get(uri.attendance.report, req.cookies)
        .then(attendance.parseReport)
        .then(courses => fetchAttendanceDetails(courses, uri.attendance.details, req.cookies, attendance.parseDetails)),
      requests.get(uri.schedule.timetable, req.cookies)
        .then(schedule.parseDaily),
      requests.get(uri.schedule.exam, req.cookies)
        .then(schedule.parseExam),
      requests.get(uri.marks, req.cookies)
        .then(academic.parseMarks)
        .then(marksReports => updateMarksCollection(courseCollection, marksReports, req.body.reg_no, semester, year))
    ];

    fetchData = Promise.all(tasks)
  }
  fetchData.then(results => {
    // Finally, send results as json.
    res.json({
      'attendance': results[0],
      'timetable': results[1],
      'exam_schedule': results[2],
      'marks': results[3],
      'assignments': results[4],
      'semester': req.body.semester,
      'default_semester': defaultSemester
    })

    process.nextTick(() => {
      const facultyCollection = new database.FacultyCollection();
      const facultyUrl = "https://vtopbeta.vit.ac.in/vtop/proctor/viewProctorDetails";
      requests.post(facultyUrl, req.cookies, {})
      .then(home.parseFaculty)
      .then(facultyCollection.insertOrUpdate)
    })
  }).catch(next);
});




function fetchAttendanceDetails(courses, uri, cookies, parseDetails) {
  return Promise.all(courses.map(course => {
    return requests.post(uri, cookies, course.form)
      .then(parseDetails).then((details) => {

        if (details.length > 0 && course.attendance_percentage === '0') {
          const units = (course.slot[0] === 'L' ? course.slot.split('+').length : 1);
          const total_classes = units * details.length;
          const attended_classes = total_classes - details.reduce((sum, detail) => sum + units * (detail.status === 'Absent'), 0);
          const attendance_percentage = (attended_classes * 100 / total_classes).toFixed();

          course.total_classes = total_classes.toString();
          course.attended_classes = attended_classes.toString();
          course.attendance_percentage = attendance_percentage.toString();
        }

        course.details = details;
        delete course.form;
        return course;
      });
  }));
}


function updateMarksCollection(courseCollection, marksReports, reg_no, semester, year) {

  // const marks = [];
  // for (let i = 0; i < marksReports.length; i++) {
  //   for (let j = 0; j < marksReports[i].marks.length; j++) {
  //     marks.push({
  //       class_number: marksReports[i].class_number,
  //       title: marksReports[i].marks[j].title,
  //       scored_marks: marksReports[i].marks[j].scored_marks,
  //       semester: semester,
  //       year: year
  //     });
  //   }
  // }

  return courseCollection.insertOrUpdateMarks(reg_no, marksReports)
    .then(() => {
      const processReport = report =>
        courseCollection.aggregate(report.class_number)
          .then(aggregates => {
            const tasks = [];
            const topic = `${semester}/${year}/${report.class_number}`;
            for (let i = 0; i < report.marks.length; i++) {
              const title = report.marks[i].title
              report.marks[i].aggregates = aggregates[title];
              if (report.marks[i].count === 1) {
                tasks.push(notification.sendNotification(topic, `Marks updated for ${title}`))
              }
            }
            return Promise.all([report, tasks]);
          })
          .then(result => result[0])

      return Promise.all(marksReports.map(processReport));
    });
}




module.exports = router;
