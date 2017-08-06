const cheerio = require('cheerio');
const requests = require('./requests');
const CaptchaParserBeta = require('./CaptchaParserBeta');
const logger = require('winston');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function getCookieBeta(username, password, campus) {
  return requests.getCookies('https://vtopbeta.vit.ac.in/vtop/', null)
  .then(result => {
    const $ = cheerio.load(result.body);
    const imageUrl = $('img').eq(1).attr('src');
    return Promise.all([result.cookies, CaptchaParserBeta.getCaptcha(imageUrl)])
  })
  .then(result => requests.postCookies('https://vtopbeta.vit.ac.in/vtop/processLogin', result[0],  { 'uname': username, 'passwd': password, 'captchaCheck': result[1] }))
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
};
module.exports = getCookieBeta



