const tabletojson = require('tabletojson');
const Promise = require('bluebird');

/**
 * timetable.parseDaily
 *
 * parse current semester's daily timetable
 * test-input: test/data/course_regular.html
 */

module.exports.parseDaily = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0]
      const schedule = table.slice(2, table.length - 11)
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
      resolve(schedule);
    } catch (ex) {
      reject(ex);
    }
  });
}

/**
 * timetable.parseExam
 *
 * parse current semester's exam schedule
 * test-input: test/data/exam_schedule.html
 */

module.exports.parseExam = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0]
      const schedule = {
        'CAT - I': [],
        'CAT - II': [],
        'Final Assessment Test': []
      };
      let key = 'CAT - I';
      table.slice(2, table.length - 1)
      for (let i = 3; i < table.length - 1; i++) {
        let row = table[i];
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
      resolve(schedule);
    } catch (ex) {
      reject(ex);
    }
  });
}
