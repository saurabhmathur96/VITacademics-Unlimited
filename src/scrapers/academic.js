var cheerio = require('cheerio');

/**
 * history.parse
 *
 * parse academic history and output a list of grades
 * test-input: test/data/student_history.html
 */

module.exports.parseHistory = (html) => {
  //
  // Some magic here
}


/**
 * academic.parseMarks
 *
 * parse current semester's marks
 * test-input: test/data/marks.html
 */

module.exports.parseMarks = (html) => {
  return new Promise((resolve, reject) => {
    try {
      let $ = cheerio.load(html, { normalizeWhitespace: true });

      let marks = $("table").eq(1)
        .find("tr[bgcolor='#EDEADE']")
        .map((i, element) => {

          let course_marks = $(element).next()
            .find("table")
            .find("tr[bgcolor='#CCCCCC']")
            .map((j, e) => {

              let td = $(e).find("td");
              return {
                title: td.eq(1).text().trim(),
                max_marks: parseFloat(td.eq(2).text()),
                weightage: parseFloat(td.eq(3).text()),
                conducted_on: "Tentative, set by course faculty",
                status: td.eq(4).text(),
                scored_marks: parseFloat(td.eq(5).text()),
                scored_percentage: parseFloat(td.eq(6).text())
              };

            }).get();

          let td = $(element).find("td");
          return {
            class_number: parseInt(td.eq(1).text()),
            course_code: td.eq(2).text(),
            course_title: td.eq(3).text(),
            course_type: td.eq(6).text(),
            marks: course_marks
          }

        }).get();
      resolve(marks);

    }
    catch (ex) {
      reject(ex);
    }

  });
}





