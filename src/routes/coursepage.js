/**
 * @module routes/coursepage
 */

const path = require('path');
const requests = require(path.join(__dirname,"src","utilities","requests"));
const coursepage = require(path.join(__dirname,"src","scrapers","coursepage"));
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

router.post('/',(req, res, next) => {
  req.getValidationResult().then((result) => {
    if(!result.isEmpty()){
      const message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      err.status = 400;
      throw err;
    }

    const uri = {
      'teacher_page': 'https://vtopbeta.vit.ac.in/vtop/processViewStudentCourseDetail'
      //add other uri here
    };
    //get course details from database in course
    const course = getCourseDetails();
    if (course != null){
      const formData = {
        'classId': course.class_number,
        'slot': course.slot,
        'semesterSubId': course.semesterSubId
      };

      return requests.post(uri.teacher_page, req.cookies, formData)
        .then(coursepage.parseCoursePageBeta)
        .then(details => res.json({'details': details}))
    } else {
      return;
    }
  })
  .catch(next);
}

function getCourseDetails(){
  //function body here
  return;
}

module.exports = router;
