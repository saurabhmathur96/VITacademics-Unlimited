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
      cookies.forEach(cookie => cookieJar.add(unirest.cookie(cookie), uri));
      request = request.jar(cookieJar);
    }

    request
      .headers({
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
      })
      .timeout(26000)
      .end(response => {
        if (response.error) {
          logger.error(response.error);
          return reject(new Error("VTOP servers seem to be down"));
        }
        if (response.headers["set-cookie"]) {
          cookies = cookies.concat(
            response.headers["set-cookie"].join(";").split(/;[ ]?/)
          );
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
      cookies.forEach(cookie => cookieJar.add(unirest.cookie(cookie), uri));
      request = request.jar(cookieJar);
    }

    request
      .headers({
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36"
      })
      .form(form)
      .timeout(26000)
      .end(response => {
        if (response.error) {
          logger.error(response.error);
          return reject(new Error("VTOP servers seem to be down"));
        }
        if (response.headers["set-cookie"]) {
          cookies = cookies.concat(
            response.headers["set-cookie"].join(";").split(/;[ ]?/)
          );
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
