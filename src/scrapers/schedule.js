/**
 * @module scrapers/schedule
 */
const tabletojson = require('tabletojson');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const moment = require('moment');

/*const courseTypes = {
  "TH": "Theory Only",
  "LO": "Lab Only",
  "ETH": "Embedded Theory",
  "ELA": "Embedded Lab",
  "EPJ": "Embedded Project",
  "SS": "Soft Skill"
}*/


/**
 * parse current semester's daily timetable
 * test-input: test/data/course_regular.html
 * @function parseDaily
 * @param {String} html
 * @returns {Promise<DailySchedule>}
 */

module.exports.parseDaily = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      html = $('table[cellspacing=0]').eq(1).html()
      if (html === null || html === undefined) {
        return resolve([]);
      }
      const table = tabletojson.convert(`<table>${html}</table>`, { ignoreEmptyRows: true, allowHTML: false })[0]
      if (table === null || table === undefined) {
        return resolve([]);
      }
      const schedule = table.slice(1)// table.slice(2, table.length - 11)
        .filter(row => (Object.keys(row).length == 15) || (Object.keys(row).length == 10))
        .map((row) => {
          if (Object.keys(row).length == 15) {
            return {
              'class_number': row[2],
              'course_code': row[3],
              'course_name': row[4],
              'course_type': row[5],
              'ltpjc': row[6],
              'course_mode': row[7],
              'course_option': row[8],
              'slot': row[9],
              'venue': row[10],
              'faculty_name': row[11],
            }
          } else {
            return {
              'class_number': row[0],
              'course_code': row[1],
              'course_name': row[2],
              'course_type': row[3],
              'ltpjc': row[4],
              'course_mode': row[5],
              'course_option': row[6],
              'slot': row[7],
              'venue': row[8],
              'faculty_name': row[9],
            }

          }
        })
        .filter((course) => !isNaN(course.class_number))
      return resolve(schedule);
    } catch (ex) {
      return reject(ex);
    }
  });
}



/**
 * parse current semester's daily timetable from vtopbeta
 * test-input: test/data/processViewTimeTable.html
 * @function parseDailyBeta
 * @param {String} html
 * @returns {Promise<DailySchedule>}
 */

module.exports.parseDailyBeta = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      html = $('#studentDetailsList').html()
      if (html === null || html === undefined) {
        return resolve([]);
      }
      const table = tabletojson.convert(`<table>${html}</table>`, { ignoreEmptyRows: true, allowHTML: false })[0];

      if (table === null || table === undefined) {
        return resolve([]);
      }
      const schedule = table.map((row) => {
        if (row['Class\n\t\t\t\t\t\t\t\t\t\t\t\t\tNbr'] === undefined) {
          return null;
        }
        return {
          'class_number': row['Class\n\t\t\t\t\t\t\t\t\t\t\t\t\tNbr'].trim(),
          'course_code': row['Course\n\t\t\t\t\t\t\t\t\t\t\t\t\tCode'].trim(),
          'course_name': row['Course\n\t\t\t\t\t\t\t\t\t\t\t\t\tTitle'].trim(),
          'course_type': row['Course\n\t\t\t\t\t\t\t\t\t\t\t\t\tType'].trim(),
          'ltpjc': row['L T P J C'].replace(/ +/g, ""),
          'course_option': row['Course\n\t\t\t\t\t\t\t\t\t\t\t\t\tOption'].trim(),
          'course_mode': 'NA',
          'slot': row['Slot'].trim(),
          'venue': row['Venue'].trim(),
          'faculty_name': row['Faculty\n\t\t\t\t\t\t\t\t\t\t\t\t\tName'].trim().replace(/\s+/g, ' '),
        }
      }).filter(n => n);
      return resolve(schedule);
    } catch (ex) {
      return reject(ex);
    }

  });
}

/**
 * parse current semester's exam schedule
 * test-input: test/data/exam_schedule.html
 * @function parseExam
 * @param {String} html
 * @returns {Promise<ExamSchedule>}
 */

module.exports.parseExam = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      html = $('table[width=897]').eq(0).html();
      const table = tabletojson.convert(`<table> ${html} </table>`, { ignoreEmptyRows: true, allowHTML: false })[0]
      const schedule = {
        'CAT - I': [],
        'CAT - II': [],
        'Final Assessment Test': []
      };
      if (table === null || table === undefined) {
        return resolve(schedule);
      }
      let key = 'CAT - I';
      for (let i = 1; i < table.length - 1; i++) {
        const row = table[i];
        if (row[0] === 'CAT - I' || row[0] === 'CAT - II' || row[0] === 'Final Assessment Test') {
          key = row[0];
        } else {
          schedule[key].push({
            course_code: row[1],
            course_name: row[2],
            course_type: row[3],
            slot: row[4],
            exam_date: row[5],
            week_day: row[6],
            session: row[7],
            time: row[8],
            venue: row[9],
            table_number: row[10]
          })
        }
      }
      return resolve(schedule);
    } catch (ex) {
      return reject(ex);
    }
  });
}


/**
 * parse current semester's exam schedule
 * test-input: test/data/doSearchExamScheduleForStudent.html
 * @function parseExam
 * @param {String} html
 * @returns {Promise<ExamSchedule>}
 */

module.exports.parseExamBeta = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      html = $('table').eq(0).html();
      const table = tabletojson.convert(`<table> ${html} </table>`, { ignoreEmptyRows: true, allowHTML: false })[0]
      const schedule = {
        'CAT - I': [],
        'CAT - II': [],
        'Final Assessment Test': []
      };
      const keyMap = {
        'CAT1': 'CAT - I',
        'CAT2': 'CAT - II',
        'FAT': 'Final Assessment Test'
      }
      if (table === null || table === undefined) {
        return resolve(schedule);
      }
      let key = 'CAT - I';
      for (let i = 1; i < table.length; i++) {
        const row = table[i];
        const title = keyMap[row[0]];
        if (title === 'CAT - I' || title === 'CAT - II' || title === 'Final Assessment Test') {
          key = title;
        } else {

          schedule[key].push({
            course_code: row[1],
            course_name: row[2],
            course_type: row[3],
            slot: row[5],
            exam_date: row[6],
            week_day: moment(row[6], "DD-MMM-YYYY").format('ddd').toUpperCase(),
            session: row[7],
            time: row[8],
            venue: row[9],
            table_number: row[10]
          })
        }
      }
      return resolve(schedule);
    } catch (ex) {
      return reject(ex);
    }
  });
}
