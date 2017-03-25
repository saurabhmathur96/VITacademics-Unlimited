var unirest = require('unirest');

module.exports.post = (uri, cookie, form) => {
  return new Promise((resolve, reject) => {
    let request = unirest.post(uri).jar(cookie);
    if (form !== null && form !== undefined) {
      request = request.form(form);
    }
    request.timeout(28000).end(response => {
      if (response.error) reject(response.error);
      resolve(response.body);
    });
  })
}
