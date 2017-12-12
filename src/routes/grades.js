/**
 * @module routes/grades
 */
const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const express = require('express');
const router = express.Router();

/**
 * POST /grades
 *
 * respond with academic history
 */


router.post('/', (req, res, next) => {
  const campus = req.body.campus;
  var baseUri;
  if (campus == 'chennai') {
    baseUri = 'https://academicscc.vit.ac.in/student';
    const uri = `${baseUri}/student_history.asp`;
    const task = requests.get(uri, req.cookies);
    task.then(academic.parseHistory)
      .then(result => res.json(result))
      .catch(next);
  }
  else {
    baseUri = 'https://vtop.vit.ac.in/student';
    const uri = `${baseUri}/student_history.asp`;
    const gradesUri = 'https://vtopbeta.vit.ac.in/vtop/examinations/examGradeView/doStudentGradeView';

    resultFinal = {};
    gradesData = {};

    const tasks = [
      requests.get(uri, req.cookies)
        .then(academic.parseHistory)
        .then(resultFinal),
      requests.post(gradesUri, req.cookies, { 'semesterSubId': 'VL2017181' })
        .then(academic.parseGrades)
        .then(gradesData)
    ];

    fetchData = Promise.all(tasks);
    fetchData.then(results => {
      var final = results[0];
      final.grades.push(results[1].grades);

      res.json(final);
    }).catch(next);
  }
});

module.exports = router;
