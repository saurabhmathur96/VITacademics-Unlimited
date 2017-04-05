const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const home = require(path.join(__dirname, '..', 'scrapers', 'home'));
const Promise = require('bluebird');
const express = require('express');
let router = express.Router();

/**
 * POST /home
 *
 * respond with spotlight items and faculty messages
 */

const semester = process.env.SEM || 'WS';

const uri = {
  spotlight: 'https://vtop.vit.ac.in/student/include_spotlight.asp',
  messages: `https://vtop.vit.ac.in/student/class_message_view.asp?sem=${semester}`
};

router.post('/', (req, res, next) => {
  const tasks = [
    requests.get(uri.spotlight, req.cookies).then(home.parseSpotlight),
    requests.get(uri.messages, req.cookies).then(home.parseMessages)
  ];

  Promise.all(tasks)
    .then(results => res.json({ 'spotlight': results[0], 'messages': results[1] }))
    .catch(next);
});

module.exports = router;
