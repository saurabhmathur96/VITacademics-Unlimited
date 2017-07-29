const Zombie = require('zombie');
const parser = require('./CaptchaParser');
const Promise = require('bluebird');
const logger = require('winston');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


/**
 * Gets Login Cookie via Headless Browser
 */
module.exports = (username, password) => {
  const browser = new Zombie();

  browser.on('response', function (request, response) {
    browser.response = response;
  });

  return new Promise((resolve, reject) => {
    browser.visit('https://vtop.vit.ac.in/student/stud_login.asp', (err) => {

      if (err && err.name !== 'TypeError') {
        logger.error(err);
        return reject(new Error('VTOP Servers seem to be down.'));
      }

      const now = new Date();
      browser
        .fetch('https://vtop.vit.ac.in/student/captcha.asp?x=' + now.toUTCString())
        .then((response) => {
          if (response.status === 200)
            return response.arrayBuffer();
          else
            reject(new Error(`Authentication Failed. Connection Error. (Status ${response.status})`))
        })
        .then(arrayBuffer => new Buffer(arrayBuffer))
        .then((buffer) => {
          const pixelMap = parser.getPixelMapFromBuffer(buffer);
          const captcha = parser.getCaptcha(pixelMap);

          browser.fill('regno', username)
            .fill('passwd', password)
            .fill('vrfcd', captcha)
            .pressButton('Login', () => {
              const regCookie = browser.getCookie('logstudregno');
              if (username != regCookie) {
                reject(new Error('Authentication Failed. Wrong Credentials.'));
              } else {

                resolve(browser.cookies);
              }
              
              browser.cookies = new browser.cookies.constructor();
              delete browser.cookies;

              browser.window.close();

              delete browser.tabs;
              delete browser.window;
              delete browser;
            });
        }).catch(e => {
          logger.error(e);
          return reject(new Error('VTOP Servers seem to be down.'));
        })


    });
  });
}
