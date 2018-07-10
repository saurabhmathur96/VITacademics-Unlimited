/**
 * @module scrapers/schedule
 */
const cheerio = require('cheerio');
const Promise = require('bluebird');
const moment = require('moment');

/**
 * parse my curriculum
 * test-input: 
 * @function parseCurriculumBeta
 * @param {String} html
 * @returns {Promise<Curriculum>}
 */

module.exports.parseCurriculumBeta = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      // const $ = cheerio.load(fs.readFileSync(__dirname + '/curriculum.html'));

      var course_type = ['pc', 'pe', 'uc', 'ue'];
      var col_headings = ['srno', 'code', 'title', 'course_type', 'l', 't', 'p', 'j', 'c'];

      var curr = {};
      var courses = [];
      var course = {};

      var page = $.root();
      var table = page.find("tbody");
      table_count = table.length;

      for(var i = 0; i < table_count; i++)
      {
        courses = [];
        var tr = table.eq(i).find("tr.odd");
        tr_count = tr.length;

        for(var j = 0; j < tr_count; j++)
        {
          course = {};
          var td = tr.eq(j).find("td");
          td_count = td.length;

          for(var k = 0; k < td_count; k++)
          {
            var text = td.eq(k).text();
            course[col_headings[k]] = text;
          }

          courses.push(course);
        }

        curr[course_type[i]] = courses;
      }

      return resolve(curr);
    } catch (ex) {
      return reject(ex);
    }
  });
}