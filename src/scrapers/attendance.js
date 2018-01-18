/**
 * @module scrapers/attendance
 */
const cheerio = require('cheerio');
const tabletojson = require('tabletojson')
const Promise = require('bluebird');
const _ = require('lodash');

/**
 * parse general attendance report of all registered courses
 * test-input: test/data/attn_report.html
 * @function parseReport
 * @param {String} html
 * @returns {Promise<Array<AttendanceReport>>}
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
          'attended_classes': row[6],
          'total_classes': row[7],
          'attendance_percentage': row[8]
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
      for (let i = 0; i < attendance.length; i++) {
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
 * parse general attendance report of all registered courses from vtopbeta
 * test-input: test/data/processViewStudentAttendance.html
 * @function parseReportBeta
 * @param {String} html
 * @returns {Promise<Array<AttendanceReport>>}
 */
module.exports.parseReportBeta = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      const rows = $('table').find('tr');

      const report = rows.map((i, row) => {
        const td = $(row).find('td');
//         if (td.length != 10) {
        if (td.length != 11) {
          return null;
        }

//         const fragments = td.eq(9).find('a').attr('onclick').split("'");
        const fragments = td.eq(10).find('a').attr('onclick').split("'");
        return {
          'course_code': td.eq(1).text().trim(),
          'course_title': td.eq(2).text().trim(),
          'course_type': td.eq(3).text().trim(),
          'slot': td.eq(4).text().trim(),
          'attended_classes': td.eq(7).text().trim(),
          'total_classes': td.eq(8).text().trim(),
          'attendance_percentage': td.eq(9).text().trim(),
          'form': {
            'classId': fragments[1],
            'slotName': fragments[3]
          }
        };
      }).get().filter(e => e !== null);
      return resolve(report);
    } catch (err) {
      return reject(err);
    }
  })
}

/**
 * parse a date-wise report of a particular course
 * test-input: test/data/attn_report_details.html
 * @function parseDetails
 * @param {String} html
 * @returns {Promise<Array<AttendanceDetail>>}
 */
module.exports.parseDetails = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0].slice(5);
      const details = table.map(row => {
        return {
          'date': row[1],
          'slot': row[2],
          'status': row[3]
        }
      });
      return resolve(details)
    } catch (err) {
      return reject(err);
    }
  })
}

/**
 * parse a date-wise report of a particular course from vtopbeta
 * test-input: test/data/processViewAttendanceDetail.html
 * @function parseDetailsBeta
 * @param {String} html
 * @returns {Promise<Array<AttendanceDetail>>}
 */
module.exports.parseDetailsBeta = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      const rows = $('table').find('tr');
      const details = rows.map((i, row) => {
        const td = $(row).find('td');
        if (td.length != 5) {
          return null;
        }
        return {
          'date': td.eq(1).text().trim(),
          'slot': td.eq(2).text().trim(),
          'status': td.eq(4).text().trim()
        }
      }).get().filter(e => e !== null);
      return resolve(details);
    } catch (err) {
      return reject(err);
    }
  })
}
