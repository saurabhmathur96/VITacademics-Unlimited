var cheerio = require('cheerio');
var moment = require('moment');
var momentTimezone = require('moment-timezone');
var tabletojson = require('tabletojson')

/**
 * attendance.parseReport
 *
 * parse general attendance report of all registered courses
 * test-input: test/data/attn_report.html
 */

module.exports.parseReport = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0].slice(21);
      const attendance = table.map(row => {

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
      let scraper = cheerio.load(html);
      const semcode = scraper("input[type=hidden][name='semcode']").map((i, e) => e.attribs.value);
      const classnbr = scraper("input[type=hidden][name='classnbr']").map((i, e) => e.attribs.value);
      const from_date = scraper("input[type=hidden][name='from_date']").map((i, e) => e.attribs.value);
      const to_date = scraper("input[type=hidden][name='to_date']").map((i, e) => e.attribs.value);
      const crscd = scraper("input[type=hidden][name='crscd']").map((i, e) => e.attribs.value);
      const crstp = scraper("input[type=hidden][name='crstp']").map((i, e) => e.attribs.value);

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
      resolve(attendance);
    } catch (ex) {
      reject(ex);
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
      const details = table.map((row) => {
        return {
          'date': row[1],
          'slot': row[2],
          'status': row[3],
          'units': row[4],
          'reason': row[5]
        }
      });
      resolve(details)
    } catch (err) {
      console.error(err);
      resolve(details)
    }
  })
}
