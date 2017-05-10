const cheerio = require('cheerio');
const Promise = require('bluebird');
const tabletojson = require('tabletojson');

function courseType(course_string) {
  switch (course_string) {
    case "Embedded Theory":
      return "ETH";
    case "Embedded Lab":
      return "ELA";
    case "Lab Only":
      return "LO";
    case "Theory Only":
      return "TH";
    case "Embedded Project":
      return "EPJ";
  }
}

/**
 * parseCourses
 *
 * parse courses from cal assignments page
 * test-input: test/data/cal.html
 */

module.exports.parseCourses = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const jsonObject = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[1].splice(1);

      const result = jsonObject.map(row => {

        return {
          classnbr: row['1'],
          code: row['2'],
          name: row['3'],
          type: row['4'],
          prof: row['5']
        }
      });

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  })
};

/**
 * parseAssignments
 *
 * parse assignments from a course from cal assignments page
 * test-input: test/data/assignments.html
 */

module.exports.parseAssignments = (html) => {
  return new Promise((resolve, reject) => {
    try {
      let table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[0];
      const courseTypeCode = courseType(table[0]['11']);

      const start = 5;
      const end = (courseTypeCode=="EPJ") ? 3 : table.length-6;

      const jsonObject2 = table.splice(start, end);

      const result = jsonObject2.map(assignItem => {

        let assignObject = {
          name: assignItem['1']
        };

        if (courseTypeCode == 'ELA' || courseTypeCode == 'LO') {

          assignObject.date = null;
          assignObject.max_marks = assignItem['2'];
          assignObject.assign_status = assignItem['4'];
          assignObject.mark_status = assignItem['5'];
          assignObject.marks = assignItem['6'];
        }
        else if (courseTypeCode == 'ETH' || courseTypeCode == 'TH') {

          assignObject.date = assignItem['2'];
          assignObject.max_marks = assignItem['3'];
          assignObject.assign_status = assignItem['5'];
          assignObject.mark_status = assignItem['6'];
          assignObject.marks = assignItem['7'];
        }
        else if( courseTypeCode == 'EPJ'){
          assignObject.date = null;
          assignObject.max_marks = assignItem['2'];
          assignObject.assign_status = assignItem['3'];
          assignObject.mark_status = assignItem['4'];
          assignObject.marks = assignItem['5'];
        }

        return assignObject;
      });
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  })
};
