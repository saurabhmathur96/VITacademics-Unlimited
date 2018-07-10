/**
 * @module middleware/authentication
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
const supportedCampuses = [
  "vellore",
  "chennai"
]

/**
 * middlewares that perform sign-in to vtop and vtopbeta.
 * @function authentication
 * @param {Request} req
 * @param {String} req.body.reg_no
 * @param {String} req.body.password
 * @param {String} [req.body.semester]
 * @param {String} [req.body.campus]
 * @param {Response} res
 * @param {Function} next
 */
module.exports = (req, res, next) => {
  req.checkBody('reg_no', '`reg_no` cannot be empty.').notEmpty();
  req.checkBody('password', '`password` cannot be empty.').notEmpty();
  req.checkBody('semester', '`semester` not supported.').optional().isIn(supportedSemesters);
  req.checkBody('campus', '`campus` not supported.').optional().isIn(supportedCampuses);

  req.sanitize('reg_no').trim();
  req.sanitize('password').trim();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      const message = result.array().map((error) => error.msg).join('\n');
      const err = new Error(message);
      throw err;
    } else {
      req.body.semester = req.body.semester || defaultSemester;
      const semester = req.body.semester;

      req.body.campus = req.body.campus || 'vellore';
      const campus = req.body.campus;
      var portal = (req.url === '/refresh' && campus === 'vellore') ? 'vtopbeta' : 'vtop';
      if (
        req.url === '/assignments' ||
        req.url === '/coursepage' ||
        req.url.startsWith('/hostelbeta/') ||
        req.url.startsWith('/latebeta') ||
        req.url === '/grades'
      ) {
        portal = 'vtopbeta';
      }

      if (req.url === '/assignments' && req.body.campus === 'chennai') {
        portal = 'vtop';
      }
      req.body.reg_no = req.body.reg_no.toUpperCase();


      // Add portal name to cache key. This keeps the cookies separate
      const key = crypto.createHash('md5').update(portal + req.body.reg_no + req.body.password).digest('hex');
      const value = cache.get(key);
      if (value !== null) {
         return Promise.resolve(value);
      }

      // Sign in to Vtop beta for Fall Semester
      const signIn = ((portal === 'vtopbeta') ? signInVtopBeta : signInVtop);
      return signIn(req.body.reg_no, req.body.password, campus)
        .then(cookies => {
          cache.put(key, cookies, 1 * 60 * 1000); // timeout of 1 minutes
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
