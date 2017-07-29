const cheerio = require('cheerio');
const requests = require('./requests');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
module.exports = (username, password) => {
  return requests.getCookies('https://vtopbeta.vit.ac.in/vtop/', null)
  .then(result => {
    const $ = cheerio.load(result.body);
    result.captcha = $('label').text().trim();
    return result;
  })
  .then(result => requests.postCookies('https://vtopbeta.vit.ac.in/vtop/processLogin', result.cookies,  { 'uname': username, 'passwd': password, 'captchaCheck': result.captcha }))
  .then(result => {
    const $ = cheerio.load(result.body);
    if ($('p.box-title.text-danger').text().trim()) {
      throw new Error('Username or Password is incorrect.');
    }
    return result.cookies;
  })
};
