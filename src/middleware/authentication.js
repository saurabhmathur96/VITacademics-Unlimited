/**
 * authentication
 *
 * middleware that performs sign-in to vtop.
 */

module.exports = (req, res, next) => {
  req.checkBody('reg_no', '`reg_no` cannot be empty.').notEmpty();
  req.checkBody('password', '`password` cannot be empty.').notEmpty();

  req.sanitize('reg_no').trim();
  req.sanitize('password').trim();

  //
  // Some magic here.

  if (success) {
    return next();
  } else {
    let err = new Error('Authentication failed.');
    err.status = 403;

    return next(err);
  }
}
