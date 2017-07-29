const parser = require('./CaptchaParser');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const requests = require('./requests');
const unirest = require('unirest');
const _ = require('lodash');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


/**
 * Gets Login Cookie
 */
module.exports = (username, password) => {
  return requests.getCookies('https://vtop.vit.ac.in/student/stud_login.asp', null)
    .then(result => getCaptcha(result.cookies))
    .then(result => requests.postCookies('https://vtop.vit.ac.in/student/stud_login_submit.asp', result.cookies, { 'regno': username, 'passwd': password, 'vrfcd': result.captcha }))
    .then(result => {
      try {
        const $ = cheerio.load(result.body);
        if ($('table').eq(1).find('td').eq(0).text().trim().split(/\s+/)[0] !== 'Welcome') {
          throw new Error('Username or Password is incorrect.');
        }
      } catch (ex) {
        throw new Error('Username or Password is incorrect.');
      }
      return result
    })
    .then(result => requests.getCookies('https://vtop.vit.ac.in/student/stud_home.asp', result.cookies))
    .then(result => result.cookies)
}

function getCaptcha(cookies) {
  return new Promise((resolve, reject) => {
    const cookieJar = unirest.jar();
    cookies.forEach(cookie => cookieJar.add(unirest.cookie(cookie), 'https://vtop.vit.ac.in/student/stud_login_submit.asp'));

    unirest.get('https://vtop.vit.ac.in/student/captcha.asp')
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
