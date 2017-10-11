const cheerio = require("cheerio");
const Promise = require('bluebird');

module.exports.parseCoursePageBeta = (html) => {
  return new Promise((resolve, reject) => {
    try{

      const $ = cheerio.load(html);
      const tables = $("table");
      //console.log(tables);
      const table1 = tables.eq(1);
      const table2 = tables.eq(2);


      const referenceMaterial = table1.find("tr").map(function (i,e){
        const cells = $(e).find("td");
        const link = cells.eq(1).find("a");
        if(link === null){
          return {
            "title":cells.eq(0).text(),
            "link":null
          }
        }
        return {
          "title":cells.eq(0).text(),
          "link":link.attr("href")
        }
      }).get();


      const daywiseMaterial = table2.find("tr").map(function (i,e){
        const cells = $(e).find("td");
        const link = cells.eq(4).find("a");
        if(link === null){
          return {
            "topic":cells.eq(3).text(),
            "link":null ,
            "lecture_date" : cells.eq(1).text()}
          }
        return {
          "topic":cells.eq(3).text(),
          "link":link.attr("href") ,
          "lecture_date" : cells.eq(1).text()
        }
      }).get();
      // console.log(referenceMaterial);
      return resolve({
        "referenceMaterial": referenceMaterial,
        "daywiseMaterial": daywiseMaterial
      });
    } catch(err) {
      return reject(err);
    }
  });
}
