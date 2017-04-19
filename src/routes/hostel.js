const path = require('path');
const express = require('express');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const hostel = require(path.join(__dirname, '..', 'scrapers', 'hostel'));
const moment = require('moment');
const router = express.Router();


const supportedTypes = [
  'EY', // Emergency Leave
  'AE', // Examinations (GATE)
  'HT', // Home Town / Local Guardian's Place
  'II', // Industrial Visit (Through Faculty Coordinators)
  'PJ', // Off Campus Interviews (Throught PAT Office
  'EP', // Official Events
  'WV', // Winter Vacation
  'WP'  // With Parent Leave
];

const uri = {
  submit: 'https://vtop.vit.ac.in/student/leave_request_submit.asp',
  applications: 'https://vtop.vit.ac.in/student/leave_request.asp',
  cancel: 'https://vtop.vit.ac.in/student/leave_cancel_submit.asp'
}

/**
 * POST /applications
 *
 * respond with list of leave/outing applications and their status.
 */
router.post('/applications', (req, res, next) => {
  const task = requests.get(uri.applications, req.cookies);

  task
    .then(hostel.parseLeaveApplications)
    .then((result) => res.json({ applications: result.applications, authorities: result.authorities }))
    .catch(next);
})


/**
 * POST /outing
 *
 *
 * make outing request to vtop, respond with updated leave/outing applications list.
 *
 * authority=[string]
 * place=[string]
 * reason=[string]
 * from=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * to=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 */
router.post('/outing', (req, res, next) => {
  req.checkBody('authority', '`authority` cannot be empty.').notEmpty();
  req.checkBody('place', '`place` cannot be empty.').notEmpty();
  req.checkBody('reason', '`reason` cannot be empty.').notEmpty();
  req.checkBody('from', '`entry_date` must be ISO8601 compliant.').isISO8601();
  req.checkBody('to', '`exit_date` must be ISO8601 compliant.').isISO8601();

  req.sanitize('authority').trim();
  req.sanitize('place').trim();
  req.sanitize('reason').trim();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      err.status = 400;
      throw err;
    }

    const to = moment(req.body.to);
    const from = moment(req.body.from);

    if (from.year() != to.year() || to.dayOfYear() != from.dayOfYear()) {
      let err = new Error('`to` and `from` should be on same day.');
      err.status = 400;
      throw err;
    }

    if (from.hour() < 7 || to.hour() > 18) {
      let err = new Error('Outing can only be between 7AM to 6PM.');
      err.status = 400;
      throw err;
    }

    if (to.diff(from) < 0) {
      let err = new Error('`to` should be after `from`.');
      err.status = 400;
      throw err;
    }

    const form = {
      apply: req.body.authority,
      place: req.body.place,
      reason: req.body.reason,
      lvtype: 'OG',
      remLen1: '100',
      requestcmd: 'Apply',
      exitdate: from.format('DD-MMM-YYYY'),
      sttime_hh: from.format('hh'),
      sttime_mm: from.format('mm'),
      frm_timetype: from.format('a').toUpperCase(),
      endtime_hh: to.format('hh'),
      endtime_mm: to.format('mm'),
      to_timetype: to.format('a').toUpperCase()
    };
    return requests.post(uri.submit, req.cookies, form);
  }).then(hostel.parseLeaveApplications)
    .then(result => {
      if (result.authorities.length === 0) {
        let err = new Error('Outing application is not valid.');
        err.status = 400;
        throw err;
      } else {
        res.json({ applications: result.applications, authorities: result.authorities });
      }
    }).catch(next);
});



/**
 * POST /leave
 *
 * make leave request to vtop, respond with updated leave/outing applications list.
 *
 * authority=[string]
 * place=[string]
 * reason=[string]
 * type=[string]
 * from=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * to=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 */

router.post('/leave', (req, res, next) => {
  req.checkBody('authority', '`authority` cannot be empty.').notEmpty();
  req.checkBody('place', '`place` cannot be empty.').notEmpty();
  req.checkBody('reason', '`reason` cannot be empty.').notEmpty();
  req.checkBody('type', '`type` not supported.').isIn(supportedTypes)
  req.checkBody('from', '`entry_date` must be ISO8601 compliant.').isISO8601();
  req.checkBody('to', '`exit_date` must be ISO8601 compliant.').isISO8601();

  req.sanitize('authority').trim();
  req.sanitize('place').trim();
  req.sanitize('reason').trim();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      throw err;
    }

    const to = moment(req.body.to);
    const from = moment(req.body.from);


    if (to.diff(from) < 0) {
      let err = new Error('`to` should be after `from`.');
      err.status = 400;
      throw err;
    }

    const form = {
      apply: req.body.authority,
      place: req.body.place,
      reason: req.body.reason,
      lvtype: req.body.type,
      remLen1: '100',
      requestcmd: 'Apply',
      exitdate: from.format('DD-MMM-YYYY'),
      sttime_hh: from.format('hh'),
      sttime_mm: from.format('mm'),
      frm_timetype: from.format('a').toUpperCase(),

      reentry_date: to.format('DD-MMM-YYYY'),
      endtime_hh: to.format('hh'),
      endtime_mm: to.format('mm'),
      to_timetype: to.format('a').toUpperCase()
    };
    return requests.post(uri.submit, req.cookies, form);
  }).then(hostel.parseLeaveApplications)
    .then(result => {
      if (result.authorities.length === 0) {
        let err = new Error('Leave application is not valid.');
        err.status = 400;
        throw err;
      } else {
        res.json({ applications: result.applications, authorities: result.authorities })
      }
    }).catch(next);

});


router.post('/cancel', (req, res, next) => {
  req.checkBody('application_id', '`application_id` should be an integer.').isInt();
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      throw err;
    }
    return requests.post(uri.cancel, req.cookies, {
      leave_id: req.body.application_id,
      requestcmd: 'Cancel'
    });
  }).then(hostel.parseLeaveApplications)
    .then(result => res.json({ applications: result.applications, authorities: result.authorities }))
    .catch(next)
});

module.exports = router;
