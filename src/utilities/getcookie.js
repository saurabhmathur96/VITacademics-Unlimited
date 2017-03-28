var Zombie = require('zombie');
var parser = require('./CaptchaParser');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Gets Login Cookie via Headless Browser
 */
module.exports = (username, password) => {
  var browser = new Zombie();

  browser.on('response', function (request, response) {
    browser.response = response;
  });

  return new Promise((resolve, reject) => {
    browser.visit('https://vtop.vit.ac.in/student/stud_login.asp', function () {

      var now = new Date();
      browser
        .fetch('https://vtop.vit.ac.in/student/captcha.asp?x=' + now.toUTCString())
        .then(function (response) {
          if (response.status === 200)
            return response.arrayBuffer();
          else
            reject(new Error(`Authentication Failed. Connection Error. (Status ${response.status})`))
        })
        .then(arrayBuffer => new Buffer(arrayBuffer))
        .then((buffer) => {
          var pixelMap = parser.getPixelMapFromBuffer(buffer);
          var captcha = parser.getCaptcha(pixelMap);

          browser.fill('regno', username)
            .fill('passwd', password)
            .fill('vrfcd', captcha)
            .pressButton('Login', function () {
              var regCookie = browser.getCookie('logstudregno');
              if (username != regCookie) {
                throw new Error('Authentication Failed. Wrong Credentials.');
              } else {

                resolve(browser.cookies);
              }
            });
        }).catch(err => reject(err))

    });
  });
}
