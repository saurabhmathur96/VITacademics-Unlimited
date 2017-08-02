const cheerio = require('cheerio');
const requests = require('./requests');
const CaptchaParserBeta = require('./CaptchaParserBeta');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
module.exports = (username, password) => {
  return requests.getCookies('https://vtopbeta.vit.ac.in/vtop/', null)
  .then(result => {
    const $ = cheerio.load(result.body);
    const imageUrl = $('img').eq(1).attr("src");
    return Promise.all([result.cookies, CaptchaParserBeta.getCaptcha(imageUrl)])
  })
  .then(result => requests.postCookies('https://vtopbeta.vit.ac.in/vtop/processLogin', result[0],  { 'uname': username, 'passwd': password, 'captchaCheck': result[1] }))
  .then(result => {
    const $ = cheerio.load(result.body);
    if ($('p.box-title.text-danger').text().trim()) {
      throw new Error('Username or Password is incorrect.');
    }
    return result.cookies;
  })
};

