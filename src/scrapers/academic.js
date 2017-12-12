/**
 * @module scrapers/academic
 */
const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');

const _gradeValue = {
  'S': 10,
  'A': 9,
  'B': 8,
  'C': 7,
  'D': 6,
  'E': 5,
  'F': 0,
  'P': true
}
function gradeValue(c) {
  if (c in _gradeValue) {
    return _gradeValue[c];
  } else {
    return null;
  }
}

const _gradeCharacter = {
  0: 'S',
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'N',
}
function gradeCharacter(i) {
  if (i >= 0 && i <= 7) {
    return _gradeCharacter[i];
  } else {
    return null;
  }
}

/**
 * parse academic history and output a list of grades
 * test-input: test/data/student_history.html
 * @function parseHistory
 * @param {String} html
 * @returns {Promise<Grades>}
 */

module.exports.parseHistory = (html) => {

  let data = {
    grades: [],
    semester_wise: {},
    grade_count: []
  };
  return new Promise((resolve, reject) => {
    try {
      // Scraping Grades
      const baseScraper = cheerio.load(html);
      const gradesScraper = cheerio.load(baseScraper('table table').eq(1).html());
      gradesScraper('tr').each((i, elem) => {
        if (i <= 0) {
          return;
        }
        const attrs = baseScraper(elem).children('td');
        const exam_held = moment(attrs.eq(6).text(), 'MMM-YYYY').format('YYYY-MM');
        const grade = attrs.eq(5).text();
        const credits = parseInt(attrs.eq(4).text());
        data.grades.push({
          'course_code': attrs.eq(1).text(),
          'course_title': attrs.eq(2).text().trim(),
          'course_type': attrs.eq(3).text(),
          'credits': credits,
          'grade': grade,
          'exam_held': exam_held,
          'result_date': moment(attrs.eq(7).text(), 'DD-MMM-YYYY').isValid() ? moment(attrs.eq(7).text(), 'DD-MMM-YYYY').format('YYYY-MM-DD') : null,
          'option': attrs.eq(8).text()
        });

        // Computing Semester-Wise GPA
        if (gradeValue(grade) === true) {
          if (data.semester_wise[exam_held]) {
            data.semester_wise[exam_held].credits += credits;
          }
          else {
            data.semester_wise[exam_held] = {
              exam_held: exam_held,
              credits: credits,
              gpa: 0.0
            };
          }
        }
        else if (gradeValue(grade)) {
          if (data.semester_wise[exam_held]) {
            data.semester_wise[exam_held].gpa = Math.round((data.semester_wise[exam_held].gpa * data.semester_wise[exam_held].credits + gradeValue(grade) * credits) / (data.semester_wise[exam_held].credits + credits) * 1e2) / 1e2;
            data.semester_wise[exam_held].credits += credits;
          }
          else {
            data.semester_wise[exam_held] = {
              exam_held: exam_held,
              credits: credits,
              gpa: gradeValue(grade)
            };
          }
        }
      });

      // Convert semester-wise object to array
      data.semester_wise = _.values(data.semester_wise);

      // Scraping the credit summary
      const creditsTable = baseScraper('table table').eq(2).children('tr').eq(1);
      data.credits_registered = parseInt(creditsTable.children('td').eq(0).text());
      data.credits_earned = parseInt(creditsTable.children('td').eq(1).text());
      data.cgpa = parseFloat(creditsTable.children('td').eq(2).text().trim());

      // Scraping the grade summary information
      const gradeSummaryTable = baseScraper('table table').eq(3).children('tr').eq(1);

      gradeSummaryTable.children('td').each(i => {
        data.grade_count.push({
          count: parseInt(gradeSummaryTable.children('td').eq(i).text()),
          value: gradeValue(gradeCharacter(i)) || 0,
          grade: gradeCharacter(i)
        });
      });
      data.grades = data.grades.filter((grade) => grade.credits != null && !isNaN(grade.credits));
      return resolve(data);
    }
    catch (ex) {
      return reject(ex);
    }
  });
}

/**
 * parse grades from vtopbeta
 * test-input: test/data/grades.html
 * @function parseGrades
 * @param {String} html
 * @returns {Promise<Grades>}
 */

module.exports.parseGrades = (html) => {

  let data = {
    grades: []
  };

  return new Promise((resolve, reject) => {
    try {
      // Scraping Grades
      const baseScraper = cheerio.load(html);
      const exam_held = '2017-11';
      let credits_total = 0;

      var gpa = Number(baseScraper('span[style="font-size: 18px;font-weight: bold;"]').text().split(':')[1].trim());

      dataObject = {
        "exam_held": exam_held
      };

      const gradesScraper = cheerio.load(baseScraper('table').html());
      gradesScraper('tr').each((i, elem) => {
        if (i <= 0) {
          return;
        }
        const attrs = baseScraper(elem).children('td');
        const grade = attrs.eq(12).text();
        const credits = parseInt(attrs.eq(7).text());

        if(credits>0)
          credits_total = credits_total + credits;

        data.grades.push({
          'course_code': attrs.eq(1).text(),
          'course_title': attrs.eq(2).text().trim(),
          'course_type': attrs.eq(3).text(),
          'credits': credits,
          'grade': grade,
          'exam_held': exam_held,
          'result_date': '2017-12-11',
          'option': 'NIL'
        });
      });
      data.grades.shift();
      data.grades.pop();

      dataObject.credits = credits_total;

      dataObject.gpa = gpa;
      data.semester_wise = dataObject;

      return resolve(data);
    }
    catch (ex) {
      return reject(ex);
    }
  });
}


/**
 * parse current semester's marks
 * test-input: test/data/marks.html
 * @function parseMarks
 * @param {String} html
 * @returns {Promise<Array<Marks>>}
 */

module.exports.parseMarks = (html) => {
  return new Promise((resolve, reject) => {
    try {
      let $ = cheerio.load(html, {normalizeWhitespace: true});

      const marks = $("table").eq(1)
        .find("tr[bgcolor='#EDEADE']")
        .map((i, element) => {

          const course_marks = $(element).next()
            .find("table")
            .find("tr[bgcolor='#CCCCCC']")
            .map((j, e) => {

              const td = $(e).find("td");
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

          const td = $(element).find("td");
          return {
            class_number: parseInt(td.eq(1).text()),
            course_code: td.eq(2).text(),
            course_title: td.eq(3).text(),
            course_type: td.eq(6).text(),
            marks: course_marks
          }

        }).get();
      return resolve(marks);

    }
    catch (ex) {
      return reject(ex);
    }

  });
}

  /**
   * parse current semester's marks
   * test-input: test/data/marks_beta.html
   * @function parseMarksBeta
   * @param {String} html
   * @returns {Promise<Array<Marks>>}
   */

  module.exports.parseMarksBeta = (html) => {
    return new Promise((resolve, reject) => {
      try {
        let $ = cheerio.load(html, { normalizeWhitespace: true });
        const marks = $("table").eq(0)
          .find("tr[style='background-color: #d2edf7;']")
          .map((i, element) => {

            const course_marks = $(element).next()
              .find("table")
              .find("tr[class='danger']")
              .map((j, e) => {

                const td = $(e).find("td");
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

            const td = $(element).find("td");
            return {
              class_number: td.eq(1).text(),
              course_code: td.eq(2).text(),
              course_title: td.eq(3).text(),
              course_type: td.eq(4).text(),
              marks: course_marks
            }

          }).get();
        return resolve(marks);

      }
      catch (ex) {
        return reject(ex);
      }

    });
}
