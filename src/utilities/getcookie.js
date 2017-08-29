/**
 * @module utilities/getcookie
 */

const parser = require('./CaptchaParser');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const requests = require('./requests');
const unirest = require('unirest');
const _ = require('lodash');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


/**
 * Gets Login Cookie from vtop.
 * @function getCookie
 * @param {String} username
 * @param {String} password
 * @param {String} [campus]
 */
module.exports = (username, password, campus) => {
  const baseUri = (campus === 'chennai' ? 'https://academicscc.vit.ac.in/student': 'https://vtop.vit.ac.in/student');

  return requests.getCookies(`${baseUri}/stud_login.asp`, null)
    .then(result => getCaptcha(result.cookies, campus))
    .then(result => requests.postCookies(`${baseUri}/stud_login_submit.asp`, result.cookies, { 'regno': username, 'passwd': password, 'vrfcd': result.captcha }))
    .then(result => {
      try {
        const $ = cheerio.load(result.body);
        const welcomeMessage = $('table').eq(1).find('td').eq(0).text().trim();
        const parts = welcomeMessage.split(/\s+/);
        if (parts[0] !== 'Welcome') {
          throw new Error('Username or Password is incorrect.');
        }
      } catch (ex) {
        throw new Error('Username or Password is incorrect.');
      }
      return result;
    })
    .then(result => requests.getCookies(`${baseUri}/stud_home.asp`, result.cookies))
    .then(result => result.cookies)
}

function getCaptcha(cookies, campus) {
  const baseUri = (campus === 'chennai' ? 'https://academicscc.vit.ac.in/student': 'https://vtop.vit.ac.in/student');

  return new Promise((resolve, reject) => {
    const cookieJar = unirest.jar();
    cookies.forEach(cookie => cookieJar.add(unirest.cookie(cookie), `${baseUri}/stud_login_submit.asp`));

    unirest.get(`${baseUri}/captcha.asp`)
      .jar(cookieJar)
      .encoding(null)
      .timeout(26000)
      .end(response => {
        if (response.error) return reject(new Error('Error parsing captcha.'))
        const pixelMap = parser.getPixelMapFromBuffer(response.body);
        const captcha = parser.getCaptcha(pixelMap);
        // cookies = Object.keys(response.cookies).map(key => `${key}=${response.cookies[key]}`);

        if (response.headers['set-cookie']) {
          cookies = cookies.concat(response.headers['set-cookie'].join(';').split(/;[ ]?/))
        }


        return resolve({ 'captcha': captcha, 'cookies': _.uniq(cookies) });
      });
  })
}
