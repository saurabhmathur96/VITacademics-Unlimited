const cheerio = require('cheerio');
const momentTimezone = require('moment-timezone');
const tabletojson = require('tabletojson')
const Promise = require('bluebird');
const _ = require('lodash');

/**
 * attendance.parseReport
 *
 * parse general attendance report of all registered courses
 * test-input: test/data/attn_report.html
 */

module.exports.parseReport = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0];
      if (table === null || table === undefined) {
        return resolve([]);
      }
      // Select all rows of table
      let t = table.map(e => _.values(e)).filter(e => e.length == 11);
      // Skip header
      const attendance = t.splice(1).map(row => {

        return {
          'course_code': row[1],
          'course_title': row[2],
          'course_type': row[3],
          'slot': row[4],
          'registration_date': momentTimezone.tz(row[5], 'DD/MM/YYYY HH:mm:ss', 'Asia/Kolkata').utc().toJSON(),
          'attended_classes': row[6],
          'total_classes': row[7],
          'attendance_percentage': row[8],
          'status': row[9]
        }

      });
      // Find form elements required to fetch attendance details
      const $ = cheerio.load(html);
      const semcode = $("input[type=hidden][name='semcode']").map((i, e) => e.attribs.value);
      const classnbr = $("input[type=hidden][name='classnbr']").map((i, e) => e.attribs.value);
      const from_date = $("input[type=hidden][name='from_date']").map((i, e) => e.attribs.value);
      const to_date = $("input[type=hidden][name='to_date']").map((i, e) => e.attribs.value);
      const crscd = $("input[type=hidden][name='crscd']").map((i, e) => e.attribs.value);
      const crstp = $("input[type=hidden][name='crstp']").map((i, e) => e.attribs.value);

      // Attach form elements to respective courses
      for (let i=0; i<attendance.length; i++) {
        attendance[i].form = {
          semcode: semcode[i],
          classnbr: classnbr[i],
          from_date: from_date[i],
          to_date: to_date[i],
          crscd: crscd[i],
          crstp: crstp[i]
        }
      }
      return resolve(attendance);
    } catch (ex) {
      return reject(ex);
    }

  });
}

/**
 * attendance.parseDetails
 *
 * parse a date-wise report of a particular course
 * test-input: test/data/attn_report_details.html
 */
module.exports.parseDetails = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0].slice(5);
      const details = table.map(row => {
        return {
          'date': row[1],
          'slot': row[2],
          'status': row[3],
          'units': row[4],
          'reason': row[5]
        }
      });
      return resolve(details)
    } catch (err) {
      return reject(err);
    }
  })
}
