const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const academic = require(path.join(__dirname, '..', 'scrapers', 'academic'));
const express = require('express');
const ObjectID = require('mongodb').ObjectID;
let router = express.Router();

/**
 * GET /search?name=[name]&school=[school_name]
 *
 * query the database for faculty by (name, school); Maximum results limited to 10.
 */
router.get('/search', (req, res, next) => {
  req.checkQuery('name', 'Name can only contain letters from the english alphabet.').optional().matches(new RegExp('^[a-zA-Z ]*$'));
  req.checkQuery('school', 'School can only contain letters from the english alphabet.').optional().matches(new RegExp('^[a-zA-Z ]*$'));

  req.sanitizeQuery('name').escape();
  req.sanitizeQuery('school').escape();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        let message = result.array().map((error) => error.msg).join('\n');
        let err = new Error(message);
        err.status = 400;
        throw err;
      } else {

        const name = req.query.name || '';
        const school = req.query.school || '';

        if (name.length === 0 && school.length === 0) {
          let err = new Error('No parameters provided.');
          err.status = 400;
          throw err;
        }

        let query = {};
        if (name.length > 0) {
          query.name = { $regex: name, $options: 'i' };
        }
        if (school.length > 0) {
          query.school = { $regex: school, $options: 'i' };
        }
        return query;
      }
    })
    .then((query) => req.db.collection('faculty').find(query).limit(10).toArray())
    .then((result) => res.json({ query: req.query, result: result }))
    .catch(next);
})


/**
 * GET /details/:faculty_id
 *
 * Find a specific faculty by id from the database.
 */
router.get('/details/:faculty_id', (req, res, next) => {
  req.checkParams('faculty_id', 'Faculty id is invalid.').notEmpty().isObjectId();

  req.sanitizeParams('faculty_id').trim();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) {
        let message = result.array().map((error) => error.msg).join('\n');
        let err = new Error(message);
        err.status = 400;
        throw err;
      } else {
        console.log(req.params)
        return req.params.faculty_id;
      }
    })
    .then((faculty_id) => req.db.collection('faculty').findOne({ _id: new ObjectID(faculty_id) }))
    .then((result) => {
      if (result === null || result === undefined) {
        let err = new Error(`No faculty found with id ${req.params.faculty_id}`);
        err.status = 404;
        throw err;
      } else {
        res.json(result);
      }
    }).catch(next);
});



module.exports = router;
