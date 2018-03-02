/**
 * @module utilities/getcookie-beta
 */
const cheerio = require('cheerio');
const requests = require('./requests');
const CaptchaParserBeta = require('./CaptchaParserBeta');
const logger = require('winston');
const path = require('path');
const gsidScraper = require(path.join(__dirname, '..', 'scrapers', 'gsid'))

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Gets Login Cookie from vtopbeta.
 * @function getCookie
 * @param {String} username
 * @param {String} password
 * @param {String} [campus]
 */
function getCookieBeta(username, password, campus) {
  return requests.getCookies('https://vtopbeta.vit.ac.in/vtop/', null)
    .then(result => {
      return gsidScraper.getGsid(result.body)
        .then((gsid) => {
          return requests.get('https://vtopbeta.vit.ac.in/vtop/executeApp?' + gsid, result.cookies);
        })
        .then(() => requests.postCookies('https://vtopbeta.vit.ac.in/vtop/getLogin', result.cookies))
    })
    .then((loginPage) => {
      const $ = cheerio.load(loginPage.body);
      const imageUrl = $('img').eq(1).attr('src');
      return Promise.all([
        loginPage.cookies,
        CaptchaParserBeta.getCaptcha(imageUrl)
      ])
    })
    .then(result => {
      console.log(result[0]);
      return requests.postCookies('https://vtopbeta.vit.ac.in/vtop/processLogin', result[0], {
        'uname': username,
        'passwd': password,
        'captchaCheck': result[1]
      })
    })
    .then(result => {
      const $ = cheerio.load(result.body);
      const errorMessage = $('p.box-title.text-danger').text().trim();
      if (errorMessage === 'User does not exist') {
        throw new Error('Username is incorrect.');
      } else if (errorMessage === 'Invalid Username/Password, Please try again') {
        throw new Error('Password is incorrect.');
      } else if (errorMessage === 'Invalid Captcha') {
        // retry
        return getCookieBeta(username, password);
      } else if (errorMessage) {
        logger.error('Error signing in to VTOP beta', errorMessage);
      }
      return result.cookies;
    })
}

module.exports = getCookieBeta;
