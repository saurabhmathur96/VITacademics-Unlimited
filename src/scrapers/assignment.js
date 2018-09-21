const cheerio = require("cheerio");
const Promise = require("bluebird");

module.exports.parseCourses = html => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      const tables = $("table");
      const table0 = tables.eq(0);
      const courses = table0
        .find("tr")
        .map(function(i, e) {
          const cells = $(e).find("td");
          const fac_details = $(cells.eq(12)).find("p");
          return {
            class_number: cells.eq(1).text(),
            course_code: cells
              .eq(2)
              .text()
              .trim(),
            course_title: cells
              .eq(3)
              .text()
              .trim(),
            course_type: cells.eq(4).text(),
            faculty_name:
              fac_details.eq(0).text() + " - " + fac_details.eq(1).text(),
            slot: cells.eq(11).text()
          };
        })
        .get();
      courses.shift();
      return resolve(courses);
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports.parseDA = html => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      const tables = $("table");
      const table1 = tables.eq(1);
      const details = table1
        .find("tr")
        .map(function(i, e) {
          const cells = $(e).find("td");
          return {
            title: cells.eq(1).text(),
            max_mark: cells.eq(2).text(),
            weightage: cells.eq(3).text(),
            due_date: cells
              .eq(4)
              .text()
              .trim(),
            status: cells
              .eq(5)
              .text()
              .trim()
          };
        })
        .get();
      details.shift();
      return resolve(details);
    } catch (err) {
      return reject(err);
    }
  });
};
