/**
 * authentication
 *
 * middleware that performs sign-in to vtop.
 */

var vitauth = require('vitauth');


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
      const body = req.body;
      let task = signIn(body.reg_no.toUpperCase(), body.password);

      task.then(result => {
        req.user = { name: result.name, cookie: result.cookie }
        next();
      }).catch(err => {
        let reason = `${err.message} (${err.code})`;
        let authenticationErr = new Error(`Authentication failed. ${reason}`);
        authenticationErr.status = 403;
        next(authenticationErr);
      });
    }
  });

}


function signIn(reg_no, password) {
  return new Promise((resolve, reject) => {
    vitauth.studentAuth(reg_no, password, (name, reg_no, cookieJar, err) => {
      if (err) return reject(err);
      resolve({
        name: name,
        cookie: cookieJar
      });
    });
  });
}
