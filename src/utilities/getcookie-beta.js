/**
 * @module utilities/getcookie-beta
 */
const cheerio = require("cheerio");
const requests = require("./requests");
const CaptchaParserBeta = require("./CaptchaParserBeta");
const logger = require("winston");
const path = require("path");
const gsidScraper = require(path.join(__dirname, "..", "scrapers", "gsid"));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/**
 * Gets Login Cookie from vtopbeta.
 * @function getCookie
 * @param {String} username
 * @param {String} password
 * @param {String} [campus]
 */
function getCookieBeta(username, password, campus, attempt = 0,cookies = null) {
  return requests
    .getCookies("https://vtop.vit.ac.in/vtop/", cookies)
    .then(result => {
      return requests.postCookies(
            "https://vtop.vit.ac.in/vtop/vtopLogin",
         result.cookies,{});
    })
    .then(loginPage => {
      if(loginPage.body.indexOf("Session Timed out") != -1){
        return getCookieBeta(username,password,campus,attempt,loginPage.cookies);
      }
      const $ = cheerio.load(loginPage.body);
      const imageUrl = $("img")
        .eq(1)
        .attr("src");
      return Promise.all([
        loginPage.cookies,
        CaptchaParserBeta.getCaptcha(imageUrl)
      ]);
    })
    .then(result => {
      return requests.postCookies(
        "https://vtop.vit.ac.in/vtop/doLogin",
        result[0],
        {
          uname: username,
          passwd: password,
          captchaCheck: result[1]
        }
      );
    })
    .then(result => {
      const $ = cheerio.load(result.body);
      const errorMessage = $("p.box-title.text-danger")
        .text()
        .trim();
      if (errorMessage === "User does not exist") {
        throw new Error("Username is incorrect.");
      } else if (
        errorMessage === "Invalid User Id / Password"
      ) {
        throw new Error("Password is incorrect.");
      } else if (errorMessage === "Invalid Captcha") {
        // retry
        return getCookieBeta(username, password);
      } else if (errorMessage) {
        if (attempt < 3) {
          attempt += 1;
          return getCookieBeta(username, password, campus, attempt);
        }
        logger.error("Error signing in to VTOP", errorMessage);
      }
      return result.cookies;
    });
}

module.exports = getCookieBeta;
