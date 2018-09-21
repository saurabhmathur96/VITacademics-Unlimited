/**
 * @module routes/latebeta
 */
const path = require("path");
const express = require("express");
const requests = require(path.join(__dirname, "..", "utilities", "requests"));
const late = require(path.join(__dirname, "..", "scrapers", "hostel"));
const moment = require("moment");
const router = express.Router();

const supportedTimes = ["0", "1", "2", "3", "4", "5", "6"];

const supportedSchools = [
  "74",
  "98",
  "73",
  "75",
  "76",
  "77",
  "78",
  "80",
  "81",
  "82",
  "84",
  "83",
  "88",
  "92",
  "96",
  "95",
  "97"
];

const uri = {
  init: "https://vtopbeta.vit.ac.in/vtop/hostels/lab/permission",
  apply: "https://vtopbeta.vit.ac.in/vtop/hostels/lab/permission/apply",
  submit: "https://vtopbeta.vit.ac.in/vtop/hostels/lab/permission/submit",
  applications:
    "https://vtopbeta.vit.ac.in/vtop/hostels/lab/permission/view/status",
  cancel: "https://vtopbeta.vit.ac.in/vtop/hostels/student/leave/cancel"
};

/**
 * POST /applications
 *
 * respond with list of leave/outing applications and their status.
 */
router.post("/applications", (req, res, next) => {
  let applicationStatus = null;
  const tasks = [
    requests.post(uri.init, req.cookies),
    requests
      .post(uri.applications, req.cookies)
      .then(late.parseLeaveApplicationsBeta)
      .then(result => res.json({ applications: result.applications }))
  ];
  applicationStatus = Promise.all(tasks).catch(next);
});

/**
 * POST /apply
 *
 * make leave request to vtopbeta, respond with updated late applications list.
 * school=[string]
 * faculty_id=[string]
 * place=[string]
 * reason=[string]
 * from_date=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * to_date=[string,ISO 8601 UTC] ex. 2017-04-09T06:48:37.745Z
 * from_time=[string] ex. 0 for 08:00 PM (8PM to 2AM)
 * to_time=[string] ex. 4 for 12:00 AM (8PM to 2AM)
 */

router.post("/apply", (req, res, next) => {
  req.checkBody("school", "`school` not supported.").isIn(supportedSchools);
  req.checkBody("faculty_id", "`faculty_id` cannot be empty.").notEmpty();
  req.checkBody("place", "`place` cannot be empty.").notEmpty();
  req.checkBody("reason", "`reason` cannot be empty.").notEmpty();
  req
    .checkBody("from_date", "`from_date` must be ISO8601 compliant.")
    .isISO8601();
  req.checkBody("to_date", "`to_date` must be ISO8601 compliant.").isISO8601();
  req
    .checkBody("from_time", '`from_time` can be from "08:00 PM" to "04:00 AM".')
    .isIn(supportedTimes);
  req
    .checkBody("to_time", '`to_time` can be from "09:00 PM" to "05:00 AM".')
    .isIn(supportedTimes);

  req.sanitize("faculty_id").trim();
  req.sanitize("place").trim();
  req.sanitize("reason").trim();

  let applyLeave = null;

  const to = moment(req.body.to);
  const from = moment(req.body.from);

  if (to_date.diff(from_date) < 0) {
    let err = new Error("`to_date` should be after `from_date`.");
    err.status = 400;
    throw err;
  }
  if (
    supportedTimes.indexOf(req.body.to_time) <
    supportedTimes.indexOf(req.body.from_time)
  ) {
    let err = new Error("`to_time` should be after `from_time`.");
    err.status = 400;
    throw err;
  }

  const form = {
    school: req.body.school,
    appliedTo: req.body.faculty_id,
    visitingPlace: req.body.place,
    reason: req.body.reason,
    leaveFromDate: from.format("DD-MMM-YYYY"),
    leaveToDate: to.format("DD-MMM-YYYY"),
    fromTime: supportedTimes[req.body.from_time],
    toTime: supportedTimes[req.body.to_time]
  };
  const tasks = [
    requests.post(uri.init, req.cookies),
    requests.post(uri.apply, req.cookies),
    requests.post(uri.submit, req.cookies, form),
    requests
      .post(uri.applications, req.cookies)
      .then(late.parseLeaveApplicationsBeta)
      .then(result => {
        res.json({ applications: result.applications });
      })
  ];
  applyLeave = Promise.all(tasks).catch(next);
});

/**
 * POST /cancel
 *
 * cancel a late request, respond with updated late applications list.
 *
 * application_id=[string]
 * place = [string]
 */
router.post("/cancel", (req, res, next) => {
  req.checkBody("place", "`place` cannot be empty.").notEmpty();

  let cancelApplication = null;

  const form = {
    primaryValue: req.body.application_id,
    secondaryValue: req.body.place
  };
  const tasks = [
    requests.post(uri.init, req.cookies),
    requests.post(uri.applications, req.cookies),
    requests.post(uri.cancel, req.cookies, form),
    requests
      .post(uri.applications, req.cookies)
      .then(late.parseLeaveApplicationsBeta)
      .then(result => res.json({ applications: result.applications }))
  ];
  cancelApplication = Promise.all(tasks).catch(next);
});

module.exports = router;
