const cheerio = require('cheerio');
const Promise = require('bluebird');
const tabletojson = require('tabletojson')

/**
 * hostel.parseLeaveReport
 *
 * parse report of applied leave requests
 * test-input: test/data/leave_request.html
 */


module.exports.parseLeaveApplications = (html) => {
  return new Promise((resolve, reject) => {
    try {
      let $ = cheerio.load(html);
      const authorities = $('select[name=apply] > option')
        .toArray()
        .map(e => { return { 'id': $(e).val(), 'name': $(e).text() } })
        .filter(e => (e.name.length > 0) && (e.id.length > 0));

      html = $('table[cellpadding=4]').html();
      const table = tabletojson.convert(`<table>${html}</table>`, { ignoreEmptyRows: true, allowHTML: false })[0];

      let applications
      if (table === null || table === undefined) {
        applications = [];
      } else {
        applications = table.splice(1).map(row => {
          return {
            application_id: row[1],
            from: row[4],
            to: row[5],
            request_type: row[6],
            status: row[7]
          }
        });
      }
      resolve({
        applications: applications,
        authorities: authorities
      });
    } catch (ex) {
      reject(ex);
    }
  });

}
