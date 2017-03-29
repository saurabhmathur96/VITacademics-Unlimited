var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');

/**
 * home.parseMessages
 *
 * parse messages from home page
 * test-input: test/data/stud_home.html
 */


module.exports.parseMessages = (html) => {
  //
  // Some magic here
};

/**
 * home.parseSpotlight
 *
 * parse the spotlight notfications
 * test-input: test/data/include_spotlight.html
 */

module.exports.parseSpotlight = (html) => {
  return new Promise((resolve, reject) => {
    try {
      var baseScraper = cheerio.load(html);
      cheerioTableparser(baseScraper);
      var tables = baseScraper('table');
      var content = [];
      var title;
      var result = [];
      var tableScaper = baseScraper(tables[tables.length - 1]).parsetable(true, true, false)[0];
      tableScaper.forEach(function (data) {
        if (baseScraper(data)['0']['attribs'] && baseScraper(data)['0']['attribs']['color'] && baseScraper(data)['0']['attribs']['color'] == '#000000') {
          if (content.length != 0) {
            result.push({
              title: title,
              data: content
            });
          }
          content = [];
          title = baseScraper(data).text();
        }
        else if (baseScraper(data)['0'].name == 'span' || baseScraper(data)['0'].name == 'a') {
          content.push({
            link: baseScraper(data)['0'].attribs.href,
            text: baseScraper(data).text()
          });
        }
      });
      resolve(result);
    }
    catch (ex){
      reject(ex);
    }
  })
};
