const Promise = require('bluebird');

module.exports.getGsid = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const index = html.indexOf("gsid");
      const id = html.substring(index, index + 12);
      return resolve(id);
    } catch (ex) {
      reject(ex);
    }
  });
}
