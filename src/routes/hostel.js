const path = require('path');
const express = require('express');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const hostel = require(path.join(__dirname, '..', 'scrapers', 'hostel'));
const moment = require('moment');
let router = express.Router();


const supportedTypes = ['EY', // Emergency Leave
                        'AE', // Examinations (GATE)
                        'HT', // Home Town / Local Guardian's Place
                        'II', // Industrial Visit (Through Faculty Coordinators)
                        'PJ', // Off Campus Interviews (Throught PAT Office
                        'EP', // Official Events
                        'WV', // Winter Vacation
                        'WP'];// With Parent Leave

const uri = {
  submit: 'https://vtop.vit.ac.in/student/leave_request_submit.asp',
  applications: 'https://vtop.vit.ac.in/student/leave_request.asp'
}

/**
 * POST /applications
 *
 * respond with list of leave/outing applications and their status.
 */
router.post('/applications', (req, res, next) => {
  const task = requests.get(uri.applications, req.cookies).then(hostel.parseLeaveApplications)

  task.then((result) => {
    res.json(result);
  }).catch(next);
})


/**
 * POST /outing
 *
 *
 * make outing request to vtop, respond with updated leave/outing applications list.
 * authority=[string]
 * place=[string]
 * reason=[string]
 * from=[string,ISO 8601 UTC] ex. 2017-04-08T07:03:45+00:00
 * to=[string,ISO 8601 UTC]
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
      throw err;
    }

    const to = moment(req.body.to);
    const from = moment(req.body.from);
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
  }).then(result => res.json({ message: 'Applied Successfully.' }))
    .catch(next);
});



/**
 * POST /leave
 *
 *
 * make leave request to vtop, respond with updated leave/outing applications list.
 * authority=[string]
 * place=[string]
 * reason=[string]
 * type=[string]
 * from=[string,ISO 8601 UTC] ex. 2017-04-08T07:03:45+00:00
 * to=[string,ISO 8601 UTC]
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
  }).then(result => res.json({ message: 'Applied Successfully.' }))
    .catch(next);

});

module.exports = router;
