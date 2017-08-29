/**
 * @module routes/home
 */
const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const home = require(path.join(__dirname, '..', 'scrapers', 'home'));
const Promise = require('bluebird');
const express = require('express');
const moment = require('moment');

const router = express.Router();

/**
 * POST /home
 *
 * respond with spotlight items and faculty messages
 */
router.post('/', (req, res, next) => {
  const campus = req.body.campus;
  const baseUri = (campus === 'chennai' ? 'https://academicscc.vit.ac.in/student' : 'https://vtop.vit.ac.in/student');
  const uri = {
    spotlight: `${baseUri}/include_spotlight.asp`,
    messages: `${baseUri}/stud_home.asp`
  };
  const tasks = [
    requests.get(uri.spotlight, req.cookies).then(home.parseSpotlight),
    requests.get(uri.messages, req.cookies).then(home.parseMessages)
  ];

  Promise.all(tasks)
    .then(results => res.json({ 'spotlight': results[0], 'messages': results[1].sort(dateTimeComparator), 'cookies': req.cookies }))
    .catch(next);
});


function dateTimeComparator(a, b) {
  const format = 'DD/MM/YYYY HH:mm:ss';
  return moment(b.time, format).valueOf() - moment(a.time, format).valueOf()
}
module.exports = router;
