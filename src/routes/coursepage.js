/**
 * @module routes/coursepage
 */

const path = require("path");
const requests = require(path.join(__dirname, "..", "utilities", "requests"));
const coursepage = require(path.join(
  __dirname,
  "..",
  "scrapers",
  "coursepage"
));
const express = require("express");
const router = express.Router();

router.post("/", (req, res, next) => {
  req
    .getValidationResult()
    .then(result => {
      if (!result.isEmpty()) {
        const message = result
          .array()
          .map(error => error.msg)
          .join("\n");
        let err = new Error(message);
        err.status = 400;
        throw err;
      }

      const uri = {
        teacher_page:
          "https://vtopbeta.vit.ac.in/vtop/processViewStudentCourseDetail"
        // add other uri here
      };
      // get course details from database in course
      const course = getCourseDetails();
      if (course != null) {
        const formData = {
          classId: course.class_number,
          slotName: course.slot,
          semSubId: course.semesterSubId
        };

        return requests
          .post(uri.teacher_page, req.cookies, formData)
          .then(coursepage.parseCoursePageBeta)
          .then(details => res.json({ details: details }));
      }
    })
    .catch(next);
});

function getCourseDetails() {
  // function body here
  // const formData = {
  //   'classId': 'VL2017181007647',
  //   'slotName': 'H1/H2',
  //   'semSubId': 'VL2017181'
  //   };
  // return formData;
}

module.exports = router;
