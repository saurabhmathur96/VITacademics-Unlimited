const path = require('path');
const requests = require(path.join(__dirname, '..', 'utilities', 'requests'));
const home = require(path.join(__dirname, '..', 'scrapers', 'home'));
const Promise = require('bluebird');
const express = require('express');
let router = express.Router();

/**
 * POST /messages
 *
 * respond with spotlight items
 */
const semester = process.env.SEM || 'WS';


const uri = {
  messages: `https://vtop.vit.ac.in/student/class_message_view.asp?sem=${semester}`
};

router.post('/', (req, res, next) => {
  const task = requests.get(uri.messages, req.cookies).then(home.parseMessages);
  task
    .then(result => res.json(result))
    .catch(next);
});

module.exports = router;
