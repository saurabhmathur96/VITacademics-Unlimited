var fs = require("fs");
var cheerio = require("cheerio");
module.exports.parseCoursePageBeta = function(src){
  // var src = fs.readFileSync("src.html",'UTF-8');
  var $ = cheerio.load(src);
  var tables = $("table");
  //console.log(tables);
  var table1 = tables.eq(1);
  var table2 = tables.eq(2);


  var referenceMaterial = table1.find("tr").map(function (i,e){
    var cells = $(e).find("td");
    var link = cells.eq(1).find("a");
    if(link === null){
      return {"title":cells.eq(0).text(),"link":null}
    }
    return {"title":cells.eq(0).text(),"link":link.attr("href")}
  }).get();


  var daywiseMaterial = table2.find("tr").map(function (i,e){
    var cells = $(e).find("td");
    var link = cells.eq(4).find("a");
    if(link === null){
      return {"topic":cells.eq(3).text(),"link":null , "lecture_date" : cells.eq(1).text()}
    }
    return {"topic":cells.eq(3).text(),"link":link.attr("href") , "lecture_date" : cells.eq(1).text()}
  }).get();


  return {
    "referenceMaterial": JSON.stringify(referenceMaterial,null,2),
    "daywiseMaterial": JSON.stringify(daywiseMaterial,null,2)
  }
//console.log(JSON.stringify(referenceMaterial,null,2));
// console.log(JSON.stringify(daywiseMaterial,null,2));

};
