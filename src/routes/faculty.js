const path = require('path');
const express = require('express');
const fs = require('fs');
const router = express.Router();

let facultyDetails = null;
const filePath = path.join(__dirname, '..', '..', 'data', 'faculty_info.json');
try {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  facultyDetails = json['faculty_info'];
} catch (ex) {
  console.error('Faculty info data-file not found. Please create a data-file at ${filePath}.');
}

/**
 * GET /all
 *
 * return a list of details of all faculty (~2.2k elements)
 */
router.get('/all', (req, res, next) => {
  if (facultyDetails === null || facultyDetails === undefined) {
    let err = new Error('Faculty details not found.');
    err.status = 500;
    return next(err);
  }
  return res.json({ faculty: facultyDetails });
})

module.exports = router;
