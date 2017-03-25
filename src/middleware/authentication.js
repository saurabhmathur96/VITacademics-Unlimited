/**
 * authentication
 *
 * middleware that performs sign-in to vtop.
 */

<<<<<<< HEAD
const getCookie = require('../utils/getcookie');
=======
var vitauth = require('vitauth');

>>>>>>> 7a197514719e5e24e43348a9f98549d6a0d15276

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
<<<<<<< HEAD
      getCookie(req.body.reg_no, req.body.password)
      .then(function(cookie){
          // console.log(cookie);
          return next();
      })
       .catch((err) => {
        err.status = 403;
        next(err);
      })
=======
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
>>>>>>> 7a197514719e5e24e43348a9f98549d6a0d15276
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
