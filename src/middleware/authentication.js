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

  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let message = result.array().map((error) => error.msg).join('\n');
      let err = new Error(message);
      err.status = 403;

      next(err);

    } else {

      //
      // Some magic here.
      let success = true;
      if (success) {
        return next();
      } else {
        let err = new Error('Authentication failed.');
        err.status = 403;

        next(err);
      }
    }
  });

}
