const Promise = require("bluebird");
const tabletojson = require("tabletojson");

const courseType = {
  "Embedded Theory": "ETH",
  "Embedded Lab": "ELA",
  "Lab Only": "LO",
  "Theory Only": "TH",
  "Embedded Project": "EPJ"
};

/**
 * parseCourses
 * parse courses from cal assignments page
 * test-input: test/data/cal.html
 * @deprecated
 */

module.exports.parseCourses = html => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, {
        ignoreEmptyRows: true,
        allowHTML: false
      });
      if (table.length < 2) {
        return resolve([]);
      }
      const result = table[1].splice(1).map(row => {
        return {
          class_number: row["1"],
          course_code: row["2"],
          course_title: row["3"],
          course_type: row["4"],
          faculty_name: row["5"]
        };
      });

      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * parseAssignments
 *
 * parse assignments from a course from cal assignments page
 * test-input: test/data/assignments.html
 * @deprecated
 */
module.exports.parseAssignments = html => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, {
        ignoreEmptyRows: true,
        allowHTML: false
      })[0];
      const courseTypeCode = courseType[table[0]["11"]];
      const start = 5;
      const end = courseTypeCode === "EPJ" ? 3 : table.length - 6;
      const spliced = table.splice(start, end);

      if (courseTypeCode === "ELA" || courseTypeCode === "LO") {
        return resolve(spliced.map(formatLabAssignment));
      } else if (courseTypeCode === "ETH" || courseTypeCode === "TH") {
        return resolve(spliced.map(formatTheoryAssignment));
      } else if (courseTypeCode === "EPJ") {
        return resolve(spliced.map(formatProjectAssignment));
      } else {
        return resolve(spliced.map(formatUnknownAssignment));
      }
    } catch (err) {
      return reject(err);
    }
  });
};

function formatLabAssignment(object) {
  return {
    name: object["1"],
    date: null,
    max_marks: object["2"],
    assign_status: object["4"],
    mark_status: object["5"],
    marks: object["6"]
  };
}

function formatTheoryAssignment(object) {
  return {
    name: object["1"],
    date: object["2"],
    max_marks: object["3"],
    assign_status: object["5"],
    mark_status: object["6"],
    marks: object["7"]
  };
}

function formatProjectAssignment(object) {
  return {
    name: object["1"],
    date: null,
    max_marks: object["2"],
    assign_status: object["3"],
    mark_status: object["4"],
    marks: object["5"]
  };
}

function formatUnknownAssignment(object) {
  return {
    name: object["1"],
    date: null,
    max_marks: null,
    assign_status: null,
    mark_status: null,
    marks: null
  };
}
