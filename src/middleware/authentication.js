/**
 * authentication
 *
 * reg_no=[string]
 * password=[string]
 *
 * middlewares that perform sign-in to vtop and vtopbeta.
 */

const signInVtop = require('../utilities/getcookie');
const signInVtopBeta = require('../utilities/getcookie-beta');
const crypto = require('crypto');
const cache = require('memory-cache');
const Promise = require('bluebird');



const defaultSemester = process.env.SEM || 'WS';
const supportedSemesters = [
  "WS", // Winter Semester
  "SS", // Summer Semester
  "IS", // Inter Semester
  "TS", // Tri Semester
  "FS" // Fall Semester
];

module.exports = (req, res, next) => {
  req.checkBody('reg_no', '`reg_no` cannot be empty.').notEmpty();
  req.checkBody('password', '`password` cannot be empty.').notEmpty();
  req.checkBody('semester', '`semester` not supported.').optional().isIn(supportedSemesters);

  req.sanitize('reg_no').trim();
  req.sanitize('password').trim();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      const message = result.array().map((error) => error.msg).join('\n');
      const err = new Error(message);
      throw err;
    } else {
      const semester = req.body.semester || defaultSemester;
      const portal = (semester === 'FS' && req.url === '/refresh') ? 'vtopbeta' : 'vtop';
      req.body.reg_no = req.body.reg_no.toUpperCase();

      // Add portal name to cache key. This keeps the cookies separate
      const key = crypto.createHash('md5').update(portal + req.body.reg_no + req.body.password).digest('hex');
      // const value = cache.get(key);
      // if (value !== null) {
      //   return Promise.resolve(value);
      // }

      // Sign in to Vtop beta for Fall Semester
      const signIn = ((portal === 'vtopbeta') ? signInVtopBeta: signInVtop);
      return signIn(req.body.reg_no, req.body.password)
        .then(cookies => {
          // cache.put(key, cookies, 2 * 60 * 1000); // timeout of 2 minutes
          return Promise.resolve(cookies);
        });
    }
  }).then(cookies => {
    req.cookies = cookies;
    next();
  }).catch(err => {
    if (!err.status) {
      err.status = 403;
    }
    next(err);
  })

}


