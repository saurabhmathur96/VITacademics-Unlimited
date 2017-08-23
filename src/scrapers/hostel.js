/**
 * @module scrapers/hotel
 */

const cheerio = require('cheerio');
const Promise = require('bluebird');
const tabletojson = require('tabletojson')

/**
 * parse report of applied leave requests
 * test-input: test/data/leave_request.html
 * @function parseLeaveReport
 * @param {String} html
 * @returns {Promise<HostelApplication>}
 */


module.exports.parseLeaveApplications = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
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
      return resolve({
        applications: applications,
        authorities: authorities
      });
    } catch (ex) {
      return reject(ex);
    }
  });

}

/**
 * parse report of applied late hours requests
 * @todo unit test
 * @function parseLateApplications
 * @param {String} html
 * @returns {Promise<LateHoursApplication>}
 */
module.exports.parseLateApplications = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      const table = $('table[class=tblFormat1]').eq(1);
      const applications = table.find('tr').map((i, row) => {
        const td = $(row).find("td");
        if (td.length === 0) {
          return null;
        }
        const application = {
          "from": td.eq(1).text().trim(),
          "to": td.eq(2).text().trim(),
          "time": td.eq(3).text().trim().replace(/\s+/g, ' '),
          "venue": td.eq(4).text().trim(),
          "reason": td.eq(5).text().trim(),
          "faculty": td.eq(6).text().trim(),
          "approved": (td.eq(7).text().trim() === 'Approved'),
          "cancel_id": null
        }
        if (!application.approved) {
          const onclick = td.eq(8).find("input").attr("onclick");
          application.cancel_id = onclick.split("'")[1] || null;
        }
        return application;
      }).get().filter(e => e !== null);
      return resolve(applications);
    } catch (ex) {
      return reject(ex);
    }
  });
}
