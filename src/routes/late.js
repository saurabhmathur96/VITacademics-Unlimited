const path = require('path');
const express = require('express');
const moment = require('moment');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const hostel = require(path.join(__dirname, '..', 'scrapers', 'hostel'));
const router = express.Router();


const supportedFromTimes = [
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "01:00 AM",
  "02:00 AM",
  "03:00 AM",
  "04:00 AM"
]

const supportedToTimes = [
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
  "01:00 AM",
  "02:00 AM",
  "03:00 AM",
  "04:00 AM",
  "05:00 AM"
]

const supportedSchools = [
  "ASC",
  "ARC",
  "CO2",
  "CBST",
  "CBCMT",
  "CCG",
  "CDMM",
  "CIMR",
  "CNBT",
  "CNR",
  "IIIP",
  "O/o-COE",
  "SAS",
  "VSPARC",
  "SBST",
  "SCALE",
  "SCOPE",
  "SELECT",
  "SENSE",
  "SITE",
  "SMEC",
  "SSL",
  "TIFAC",
  "VITBS"
]

const uri = {
  submit: 'https://vtop.vit.ac.in/student/Hostel_LAB_DBH.asp',
  applications: 'https://vtop.vit.ac.in/student/Hostel_LAB_Permission.asp',
  cancel: 'https://vtop.vit.ac.in/student/Hostel_LAB_DBH.asp'
}

router.post('/applications', (req, res, next) => {
  const task = requests.get(uri.applications, req.cookies);
  task
    .then(hostel.parseLateApplications)
    .then((applications) => res.json({ applications: applications }))
    .catch(next);
})

/**
 * POST /apply
 *
 *
 * make late permission request to vtop, respond with updated late permission applications list.
 *
 * school=[string]
 * faculty_id=[string]
 * place=[string]
 * reason=[string]
 * from_date=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * to_date=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * from_time=[string] ex. 08:00 PM (8PM to 4AM)
 * to_time=[string] ex. 12:00 AM (9PM to 5AM)
 */
router.post('/apply', (req, res, next) => {
  req.checkBody('school', '`school` not supported.').isIn(supportedSchools);
  req.checkBody('faculty_id', '`faculty_id` cannot be empty.').notEmpty();
  req.checkBody('place', '`place` cannot be empty.').notEmpty();
  req.checkBody('reason', '`reason` cannot be empty.').notEmpty();
  req.checkBody('from_date', '`from_date` must be ISO8601 compliant.').isISO8601();
  req.checkBody('to_date', '`to_date` must be ISO8601 compliant.').isISO8601();
  req.checkBody('from_time', '`from_time` can be from "08:00 PM" to "04:00 AM".').isIn(supportedFromTimes);
  req.checkBody('to_time', '`to_time` can be from "09:00 PM" to "05:00 AM".').isIn(supportedToTimes);

  req.sanitize('faculty_id').trim();
  req.sanitize('place').trim();
  req.sanitize('reason').trim();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      err.status = 400;
      throw err;
    }

    const to_date = moment(req.body.to_date);
    const from_date = moment(req.body.from_date);

    if (to_date.diff(from_date) < 0) {
      let err = new Error('`to_date` should be after `from_date`.');
      err.status = 400;
      throw err;
    }
    if (supportedToTimes.indexOf(req.body.to_time) < supportedFromTimes.indexOf(req.body.from_time)) {
      let err = new Error('`to_time` should be after `from_time`.');
      err.status = 400;
      throw err;
    }


    const form = {
      "pvActionIndicator": "SBM",
      "cvLeaveType": "LB",
      "cvSchool": req.body.school,
      "cvFaculty": req.body.faculty_id,
      "frmdate": from_date.format('DD-MMM-YYYY'),
      "todate": to_date.format('DD-MMM-YYYY'),
      "frmtm": req.body.from_time,
      "totm": req.body.to_time,
      "txtVenue": req.body.place,
      "txtRsn": req.body.reason,
    };
    return requests.post(uri.submit, req.cookies, form)
  })
    .then(hostel.parseLateApplications)
    .then((applications) => res.json({ applications: applications }))
    .catch(next);
})

/**
 * POST /cancel
 *
 * cancel a late hours request, respond with updated late hours applications list.
 *
 * application_id=[string]
 */
router.post('/cancel', (req, res, next) => {
  req.checkBody('cancel_id', '`cancel_id` cannot be empty.').notEmpty();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      throw err;
    }
    return requests.post(uri.cancel, req.cookies, {
      "pvActionIndicator": "CNCL",
      "cvLeaveType": "LB",
      "pvPermitID": req.body.cancel_id
    });
  }).then(hostel.parseLeaveApplications)
    .then(result => res.json({ applications: result.applications }))
    .catch(next)
})
module.exports = router;
