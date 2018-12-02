/**
 * @module routes/curriculum
 */
const path = require("path");
const requests = require(path.join(__dirname, "..", "utilities", "requests"));
const academic = require(path.join(__dirname, "..", "scrapers", "curriculum"));
const express = require("express");
const router = express.Router();

/**
 * POST /curriculum
 *
 * respond with my curriculum
 */

router.post("/", (req, res, next) => {
  const curriculumUri =
    "https://vtop.vit.ac.in/vtop/academics/common/Curriculum";
  requests
    .post(curriculumUri, req.cookies)
    .then(academic.parseCurriculumBeta)
    .then(results => {
      res.json(results);
    })
    .catch(next);
});

module.exports = router;
