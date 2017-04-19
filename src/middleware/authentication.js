/**
 * authentication
 *
 * middleware that performs sign-in to vtop.
 * reg_no=[string]
 * password=[string]
 */

const signIn = require('../utilities/getcookie');
const crypto = require('crypto');
const cache = require('memory-cache');
const Promise = require('bluebird');

module.exports = (req, res, next) => {
  req.checkBody('reg_no', '`reg_no` cannot be empty.').notEmpty();
  req.checkBody('password', '`password` cannot be empty.').notEmpty();

  req.sanitize('reg_no').trim();
  req.sanitize('password').trim();

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      throw err;
    } else {
      req.body.reg_no = req.body.reg_no.toUpperCase();
      const key = crypto.createHash('md5').update(req.body.reg_no + req.body.password).digest('hex');
      const value = cache.get(key);
      if (value !== null) {
        return Promise.resolve(value);
      }
      return signIn(req.body.reg_no, req.body.password)
        .then(cookies => {
          cache.put(key, cookies, 2 * 60 * 1000); // timeout of 2 minutes
          return Promise.resolve(cookies);
        });
    }
  }).then(cookies => {
    req.cookies = cookies;
    next();
  }).catch(err => {
    err.status = 403;
    next(err);
  })

}
