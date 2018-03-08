const Promise = require('bluebird');

module.exports.getGsid = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const index = html.match(/gsid=[0-9]{6,7};/);
      const id = index[0];
      const fid = id.substring(0, id.length-1);
      console.log(fid);
      return resolve(fid);
    } catch (ex) {
      reject(ex);
    }
  });
}
