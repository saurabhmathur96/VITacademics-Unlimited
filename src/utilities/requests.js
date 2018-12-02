/**
 * @module utilities/requests
 */
const unirest = require("unirest");
const Promise = require("bluebird");
const _ = require("lodash");
const logger = require("winston");


/**
 * Gets HTML markup and cookies doing get request
 * @function getCookies
 * @param {String} uri
 * @param {Array<String>} cookies
 */
module.exports.getCookies = (uri, cookies) => {
  cookies = cookies || [];
  return new Promise((resolve, reject) => {
    let request = unirest.get(uri);
    if (cookies) {
      const cookieJar = unirest.jar();
      cookies = cookies.filter(cookie => { return cookie.indexOf("SERVERID") == -1 ? true : false; });
      cookies.forEach(cookie => cookieJar.add(unirest.cookie(cookie), uri));
      cookieJar.add(unirest.cookie("SERVERID=s7"),uri);
      request = request.jar(cookieJar);
    }


    request
      .headers({
        "cache-control": "no-cache",
        "accept-language": "en-US,en;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "dnt": "1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.56 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"
      })
      .timeout(26000)
      .end(response => {
        if (response.error) {
          logger.error(response.error);
          return reject(new Error("VTOP servers seem to be down"));
        }
        if (response.headers["set-cookie"]) {
          cookies = response.headers["set-cookie"].map(row => { return row.split(";")[0] })
        }

        return resolve({ body: response.body, cookies: _.uniq(cookies) });
      });
  });
};

/**
 * Gets only HTML markup from get request
 * @function get
 * @param {String} uri
 * @param {Array<String>} cookies
 */
module.exports.get = (uri, cookies) => {
  return module.exports.getCookies(uri, cookies).then(result => result.body);
};

/**
 * Gets HTML markup doing post request
 * @function postCookies
 * @param {String} uri
 * @param {Array<String>} cookies
 * @param {Object} form
 */
module.exports.postCookies = (uri, cookies, form) => {
  cookies = cookies || [];
  return new Promise((resolve, reject) => {
    let request = unirest.post(uri);
    if (cookies) {
      const cookieJar = unirest.jar();
      cookies = cookies.filter(cookie => { return cookie.indexOf("SERVERID") == -1 ? true : false; });
      cookies.forEach(cookie => cookieJar.add(unirest.cookie(cookie), uri));
      cookieJar.add(unirest.cookie("SERVERID=s7"),uri);
      request = request.jar(cookieJar);
    }

    request
      .headers({
        "cache-control": "no-cache",
        "accept-language": "en-US,en;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "dnt": "1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.56 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        "referer":"https://vtop.vit.ac.in/vtop/initialProcess"
      })
      .form(form)
      .timeout(26000)
      .end(response => {
        if (response.error) {
          logger.error(response.error);
          return reject(new Error("VTOP servers seem to be down"));
        }
        if (response.headers["set-cookie"]) {
          cookies = response.headers["set-cookie"].map(row => { return row.split(";")[0] });
        }

        return resolve({ body: response.body, cookies: _.uniq(cookies) });
      });
  });
};

/**
 * Gets only HTML markup from post request
 * @function post
 * @param {String} uri
 * @param {Array<String>} cookies
 * @param {Object} form
 */
module.exports.post = (uri, cookies, form) => {
  return module.exports
    .postCookies(uri, cookies, form)
    .then(result => result.body);
};
