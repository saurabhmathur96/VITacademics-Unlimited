/**
 * @module routes/faculty
 */
const path = require("path");
const express = require("express");
const fs = require("fs");
const logger = require("winston");
const router = express.Router();
const FacultyCollection = require("../services/database").FacultyCollection;

// let facultyDetails = null;
// let filePath = path.join(__dirname, '..', '..', 'data', 'faculty_info.json');
// try {
//   const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//   facultyDetails = json['faculty_info'];
// } catch (ex) {
//   logger.error('Faculty info data-file not found. Please create a data-file at ${filePath}.');
// }

let lateHoursSchools = null;
const filePath = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "late_schools_beta.json"
);
try {
  const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  lateHoursSchools = json["late_schools"];
} catch (ex) {
  logger.error(
    "Faculty info data-file not found. Please create a data-file at ${filePath}."
  );
}

/**
 * GET /all
 *
 * return a list of details of all faculty (~2.2k elements)
 */
router.get("/all", (req, res, next) => {
  // if (facultyDetails === null || facultyDetails === undefined) {
  //   let err = new Error('Faculty details not found.');
  //   err.status = 500;
  //   return next(err);
  // }

  let facultyCollection = new FacultyCollection();

  facultyCollection
    .getAll()
    .then(faculties => {
      return res.json({ faculty: faculties });
    })
    .catch(next);
});

/**
 * GET /late
 *
 * return a list of school with ids of faculty who can approve late hours permission
 */
router.get("/late", (req, res, next) => {
  if (lateHoursSchools === null || lateHoursSchools === undefined) {
    let err = new Error("Faculty details not found.");
    err.status = 500;
    return next(err);
  }
  return res.json({ schools: lateHoursSchools });
});

module.exports = router;
