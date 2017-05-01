const cheerio = require('cheerio');
const Promise = require('bluebird');
const tabletojson = require('tabletojson');

/**
 * parseCourses
 *
 * parse courses from cal assignments page
 * test-input: test/data/cal.html
 */

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
  }
}

module.exports.parseCourses = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[1].splice(1);
      const jsonObject = table[0];

      jsonObject.shift();
      jsonObject.shift();

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
