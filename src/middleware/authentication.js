/**
 * authentication
 *
 * middleware that performs sign-in to vtop.
 */

const signIn = require('../utilities/getcookie');

module.exports = (req, res, next) => {
  req.checkBody('reg_no', '`reg_no` cannot be empty.').notEmpty();
  req.checkBody('password', '`password` cannot be empty.').notEmpty();

  req.sanitize('reg_no').trim();
  req.sanitize('password').trim();

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      throw err;
    } else {
      return signIn(req.body.reg_no, req.body.password);
    }
  }).then(function (cookies) {
    req.cookies = cookies;
    next();
  }).catch((err) => {
    err.status = 403;
    next(err);
  })

}
