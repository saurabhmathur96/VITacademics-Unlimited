/**
 * @module scrapers/schedule
 */
const cheerio = require("cheerio");
const Promise = require("bluebird");

/**
 * parse my curriculum
 * test-input:
 * @function parseCurriculumBeta
 * @param {String} html
 * @returns {Promise<Curriculum>}
 */

module.exports.parseCurriculumBeta = html => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      // const $ = cheerio.load(fs.readFileSync(__dirname + '/curriculum.html'));

      let course_type = ["pc", "pe", "uc", "ue"];
      let col_headings = [
        "srno",
        "code",
        "title",
        "course_type",
        "l",
        "t",
        "p",
        "j",
        "c"
      ];

      let curr = {};
      let courses = [];
      let course = {};

      let page = $.root();
      let table = page.find("tbody");
      let table_count = table.length;

      for (let i = 0; i < table_count; i++) {
        courses = [];
        let tr = table.eq(i).find("tr.odd");
        let tr_count = tr.length;

        for (let j = 0; j < tr_count; j++) {
          course = {};
          let td = tr.eq(j).find("td");
          let td_count = td.length;

          for (let k = 0; k < td_count; k++) {
            let text = td.eq(k).text();
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
};
