/**
 * @module routes/hostelbeta
 */
const path = require('path');
const express = require('express');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const hostel = require(path.join(__dirname, '..', 'scrapers', 'hostel'));
const moment = require('moment');
const router = express.Router();


const supportedTypes = [
    'WP',  // With Parent Leave
    'EP',  // Official Events
    'SV',  // Summer Vacation
    'WV',  // Winter Vacation
    'HT1', // Home Town
    'EY1', // Emergency Leave
    'LG1', // Local Guardian
    'SL1', // Semester Leave
    'OG1'  // Outing
];

const uri = {
    init: 'https://vtopbeta.vit.ac.in/vtop/hostels/student/leave',
    submit: 'https://vtopbeta.vit.ac.in/vtop/hostels/student/leave/submit',
    applications: 'https://vtopbeta.vit.ac.in/vtop/hostels/student/leave/status',
    cancel: 'https://vtopbeta.vit.ac.in/vtop/hostels/student/leave/cancel'
}

/**
 * POST /applications
 *
 * respond with list of leave/outing applications and their status.
 */
router.post('/applications', (req, res, next) => {
    let applicationStatus = null;
    const tasks = [
        requests.post(uri.init, req.cookies),
        requests.post(uri.applications, req.cookies)
            .then(hostel.parseLeaveApplicationsBeta)
            .then((result) => res.json({ applications: result.applications }))
    ];
    applicationStatus = Promise.all(tasks).catch(next);
})

/**
 * POST /leave
 *
 * make leave request to vtopbeta, respond with updated leave/outing applications list.
 *
 * place=[string]
 * reason=[string]
 * type=[string]
 * from=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * to=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 */

router.post('/leave', (req, res, next) => {
    req.checkBody('place', '`place` cannot be empty.').notEmpty();
    req.checkBody('reason', '`reason` cannot be empty.').notEmpty();
    req.checkBody('type', '`type` not supported.').isIn(supportedTypes)
    req.checkBody('from', '`from` must be ISO8601 compliant.').isISO8601();
    req.checkBody('to', '`to` must be ISO8601 compliant.').isISO8601();

    req.sanitize('place').trim();
    req.sanitize('reason').trim();

    let applyLeave = null;

    const to = moment(req.body.to);
    const from = moment(req.body.from);


    if (to.diff(from) < 0) {
        let err = new Error('`to` should be after `from`.');
        err.status = 400;
        throw err;
    }

    const form = {
        leaveCode: req.body.type,
        visitingPlace: req.body.place,
        reason: req.body.reason,
        leaveFromDate: from.format('DD-MMM-YYYY'),
        fromTime: from.format('hh:mm a').toUpperCase(),
        leaveToDate: to.format('DD-MMM-YYYY'),
        toTime: to.format('hh:mm a').toUpperCase()
    };
    const tasks = [
        requests.post(uri.init, req.cookies),
        requests.post(uri.submit, req.cookies, form),
        requests.post(uri.applications, req.cookies)
            .then(hostel.parseLeaveApplicationsBeta)
            .then(result => {
                res.json({ applications: result.applications })
            })
    ];
    applyLeave = Promise.all(tasks).catch(next);
});

/**
 * POST /cancel
 *
 * cancel a leave/outing request, respond with updated leave/outing applications list.
 *
 * application_id=[string]
 */
router.post('/cancel', (req, res, next) => {
    req.checkBody('place', '`place` cannot be empty.').notEmpty();
    
    let cancelApplication = null;

    const form = {
        primaryValue: req.body.application_id,
        secondaryValue: req.body.place
    };
    const tasks = [
        requests.post(uri.init, req.cookies),
        requests.post(uri.cancel, req.cookies, form),
        requests.post(uri.applications, req.cookies)
            .then(result => res.json({ applications: result.applications }))
    ];
    cancelApplication = Promise.all(tasks).catch(next);
});

module.exports = router;


