const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const Promise = require('bluebird');
const tabletojson = require('tabletojson')
const _ = require('lodash');

/**
 * home.parseMessages
 *
 * parse messages from home page
 * test-input: test/data/stud_home.html
 */


module.exports.parseMessages = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false })[1].splice(1);
      table.pop();

      let result = table.map(row => {
        return {
          faculty: row[0],
          subject: row[1],
          message: row[2],
          time: row[3]
        }
      });

      result = _.uniqBy(result, 'message');
      return resolve(result);
    } catch (err) {
      return reject(err);
    }
  })
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
      let baseScraper = cheerio.load(html);
      cheerioTableparser(baseScraper);
      const tables = baseScraper('table');
      let content = [];
      let title;
      let result = [];
      const tableScraper = baseScraper(tables[tables.length - 1]).parsetable(true, true, false)[0];
      tableScraper.forEach(function (data) {
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
      return resolve(result);
    }
    catch (ex) {
      return reject(ex);
    }
  })
};
