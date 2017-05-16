const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const Promise = require('bluebird');
const tabletojson = require('tabletojson')

/**
 * home.parseMessages
 *
 * parse messages from home page
 * test-input: test/data/stud_home.html
 */


module.exports.parseMessages = (html) => {
  return new Promise((resolve, reject) => {
    try {
      const $ = cheerio.load(html);
      html = $('marquee[width=450]').html();
      const table = tabletojson.convert(html, { ignoreEmptyRows: true, allowHTML: false });

      if (table.length < 1) {
        throw new Error('Unable to scrape messages.');
      }
      const messages = [];
      const allowed = ['Faculty', 'Course', 'Message', 'Sent On'];
      for (let i=0; i<table.length; i++) {
        const row = table[i].filter(e => allowed.indexOf(e[0]) > -1);
        while (row.length > 3) {
          const facultyRow = row.shift(); // take & remove first element from top
          const courseRow = row.shift();
          const messageRow = row.shift();
          const sentOnRow = row.shift();
          messages.push({
            faculty: facultyRow[2],
            subject: courseRow[2],
            message: messageRow[2],
            time: sentOnRow[2]
          });
        }
      }
      table.forEach(row => {

        row = row.filter(e => allowed.indexOf(e[0]) > -1);
        while (row.length > 3) {
          const facultyRow = row.shift(); // take & remove first element from top
          const courseRow = row.shift();
          const messageRow = row.shift();
          const sentOnRow = row.shift();
          messages.push({
            faculty: facultyRow[2],
            subject: courseRow[2],
            message: messageRow[2],
            time: sentOnRow[2]
          });
        }
      });
      return resolve(messages);

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
