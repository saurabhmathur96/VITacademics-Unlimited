var fs = require("fs");
var cheerio = require("cheerio");

module.exports.parseDA = function(src){
//   var src = fs.readFileSync("DA.html",'UTF-8');
  var $ = cheerio.load(src);
  var tables = $("table");
  //console.log(tables);
  var table1 = tables.eq(1);

  var processDA = table1.find("tr").map(function (i,e){
    var cells = $(e).find("td");
    return {"title":cells.eq(1).text(),"max-mark":cells.eq(2).text(),"weightage":cells.eq(3).text(),"due-date":cells.eq(4).text()}
  }).get();

  return {
    "processDA": JSON.stringify(processDA,null,2)
  }
// console.log(JSON.stringify(processDA,null,2));
};
