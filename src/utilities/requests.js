var unirest = require('unirest');

module.exports.post = (uri, cookie, form) => {
  let request = unirest.post(uri).jar(cookie);
  if (form !== null && form !== undefined) {
    request = request.form(form);
  }
  return request.timeout(28000).exec();
}
