const cheerio = require("cheerio");
const Promise = require('bluebird');
const _ = require('lodash');

module.exports.parseCourses = (html) => {
  return new Promise((resolve, reject) => {
    try{
      const $ = cheerio.load(html);
      const tables = $("table");
      const table0 = tables.eq(0);
      const courses = table0.find("tr").map(function (i, e){
        const cells = $(e).find("td");
        return{
          "class_number" : cells.eq(1).text(),
          "course_code" : cells.eq(2).text(),
          "course_name" : cells.eq(3).text(),
          "course_type" : cells.eq(4).text(),
          "faculty_name" : cells.eq(12).text().split("\n")[0],
          "slot" : cells.eq(13).text()
        }
      }).get();
      return resolve(courses)
    } catch(err) {
      return reject(err);
    }
  })
};

module.exports.parseDA = (html) => {
  return new Promise((resolve, reject) => {
    try{
      const $ = cheerio.load(html);
      const tables = $("table");
      //console.log(tables);
      const table1 = tables.eq(1);
      const details = table1.find("tr").map(function (i, e){
        const cells = $(e).find("td");
        return {
          "title" : cells.eq(1).text(),
          "max_mark" : cells.eq(2).text(),
          "weightage" : cells.eq(3).text(),
          "due_date" : cells.eq(4).text()
        }
      }).get().shift();
      return resolve(details)
    } catch(err) {
      return reject(err);
    }
  })
};