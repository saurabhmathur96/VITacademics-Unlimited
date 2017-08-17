const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const attendance = require(path.join(__dirname, '..', 'scrapers', 'attendance'));
const schedule = require(path.join(__dirname, '..', 'scrapers', 'schedule'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const notification = require(path.join(__dirname, '..', 'services', 'notification'));
const moment = require('moment-timezone');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();


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

  if (semester === 'FS' && campus === 'vellore') {
    // Use vtopbeta for data
    const uri = {
      schedule: {
        timetable: 'https://vtopbeta.vit.ac.in/vtop/processViewTimeTable'
      },
      attendance: {
        report: 'https://vtopbeta.vit.ac.in/vtop/processViewStudentAttendance',
        details: 'https://vtopbeta.vit.ac.in/vtop/processViewAttendanceDetail'
      }
    }
    const tasks = [
      requests.post(uri.attendance.report, req.cookies, { 'semesterSubId': 'VL2017181' })
        .then(attendance.parseReportBeta)
        .then(courses => fetchAttendanceDetails(courses, uri.attendance.details, req.cookies, attendance.parseDetailsBeta)),
      requests.post(uri.schedule.timetable, req.cookies, { 'semesterSubId': 'VL2017181' })
        .then(schedule.parseDailyBeta)
    ]
    // { 'CAT - I': [], 'CAT - II': [], 'Final Assessment Test': [] }
    fetchData = Promise.all(tasks).then((results) => [results[0], results[1], generateExamSchedule(results[1]), []]);
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
        .then(marksReports => updateMarksCollection(req.collections.marks, marksReports, req.body.reg_no, semester, year))
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
      'semester': req.body.semester,
      'default_semester': defaultSemester
    })
  }).catch(next);
});



function generateExamSchedule(dailySchedule) {
  return {
    'CAT - I': dailySchedule.map(e => {
      if (e.course_type !== "Theory Only" && e.course_type !== "Embedded Theory") return null;
      const cat1Schedule = slotToSchedule(e.slot);
      if (cat1Schedule === null) return null;

      return {
        "course_code": e.course_code,
        "course_name": e.course_name,
        "course_type": e.course_type,
        "slot": e.slot,
        "exam_date": cat1Schedule.exam_date,
        "week_day": cat1Schedule.week_day,
        "session": cat1Schedule.session,
        "time": cat1Schedule.time,
        "venue": "",
        "table_number": ""
      }
    }).filter(e => e).sort((a, b) => parseInt(a.exam_date.split('-')[0]) - parseInt(b.exam_date.split('-')[0])  ),
    'CAT - II': [],
    'Final Assessment Test': []
  }
}

function slotToSchedule(slot) {
  switch (slot) {
    case "A1":
    case "A1+TA1":
    case "A1+TA1+TAA1":
      return {
        "exam_date": "19-Aug-2017",
        "week_day": "SAT",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "A2":
    case "A2+TA2":
    case "A2+TA2+TAA2":
      return {
        "exam_date": "19-Aug-2017",
        "week_day": "SAT",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    case "TA1":
    case "TA2":
    case "TB2":
    case "TC1":
    case "TC2":
      return {
        "exam_date": "19-Aug-2017",
        "week_day": "SAT",
        "session": "EN",
        "time": "05:00 PM - 06:30 PM"
      }

    case "B1":
    case "B1+TB1":
      return {
        "exam_date": "20-Aug-2017",
        "week_day": "SUN",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "B2":
    case "B2+TB2":
    case "B2+TB2+TBB2":
      return {
        "exam_date": "20-Aug-2017",
        "week_day": "SUN",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    case "TD1":
    case "TE2":
      return {
        "exam_date": "20-Aug-2017",
        "week_day": "SUN",
        "session": "EN",
        "time": "05:00 PM - 06:30 PM"
      }

    case "C1":
    case "C1+TC1":
    case "C1+TC1+TCC1":
      return {
        "exam_date": "21-Aug-2017",
        "week_day": "MON",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "C2":
    case "C2+TC2":
    case "C2+TC2+TCC2":
      return {
        "exam_date": "21-Aug-2017",
        "week_day": "MON",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    case "TD2":
    case "TF1":
    case "TF2":
      return {
        "exam_date": "21-Aug-2017",
        "week_day": "MON",
        "session": "EN",
        "time": "05:00 PM - 06:30 PM"
      }

    case "D1":
    case "D1+TD1":
      return {
        "exam_date": "22-Aug-2017",
        "week_day": "TUE",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "D2":
    case "D2+TD2":
    case "D2+TD2+TDD2":
      return {
        "exam_date": "22-Aug-2017",
        "week_day": "TUE",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    case "TG1":
      return {
        "exam_date": "22-Aug-2017",
        "week_day": "TUE",
        "session": "EN",
        "time": "05:00 PM - 06:30 PM"
      }


    case "E1":
    case "E1+TE1":
      return {
        "exam_date": "23-Aug-2017",
        "week_day": "WED",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "E2":
    case "E2+TE2":
      return {
        "exam_date": "23-Aug-2017",
        "week_day": "WED",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    case "H1":
    case "H1+H2":
    case "H1+H2+H3":
    case "H1+H3":
    case "H1+H3+H4+H5":
    case "H2+H4":
    case "H2+H4+H5":
      return {
        "exam_date": "23-Aug-2017",
        "week_day": "WED",
        "session": "EN",
        "time": "05:00 PM - 06:30 PM"
      }

    case "F1":
    case "F1+TF1":
      return {
        "exam_date": "24-Aug-2017",
        "week_day": "THU",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "F2":
    case "F2+TF2":
      return {
        "exam_date": "24-Aug-2017",
        "week_day": "THU",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    case "K1+K2":
    case "K1+K2+K3":
    case "K3+K4+K5":
      return {
        "exam_date": "24-Aug-2017",
        "week_day": "THU",
        "session": "EN",
        "time": "05:00 PM - 06:30 PM"
      }

    case "G1":
    case "G1+TG1":
      return {
        "exam_date": "26-Aug-2017",
        "week_day": "SAT",
        "session": "FN",
        "time": "09:30 AM - 11:00 AM"
      }

    case "G2":
    case "G2+TG2":
      return {
        "exam_date": "26-Aug-2017",
        "week_day": "SAT",
        "session": "AN",
        "time": "02:30 PM - 03:30 PM"
      }

    default:
      return null;
  }
}

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


function updateMarksCollection(marksCollection, marksReports, reg_no, semester, year) {

  const marks = [];
  for (let i = 0; i < marksReports.length; i++) {
    for (let j = 0; j < marksReports[i].marks.length; j++) {
      marks.push({
        class_number: marksReports[i].class_number,
        title: marksReports[i].marks[j].title,
        scored_marks: marksReports[i].marks[j].scored_marks,
        semester: semester,
        year: year
      });
    }
  }

  return marksCollection.insertOrUpdate(reg_no, marks)
    .then(() => {
      const processReport = report =>
        marksCollection.aggregate(report.class_number, semester, year)
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
