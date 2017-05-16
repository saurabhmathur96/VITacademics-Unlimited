const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');
const Promise = require('bluebird');
const tabletojson = require('tabletojson');

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
      const allowed = ['Faculty', 'Coordinator', 'Course', 'Course Title', 'Message', 'Sent On'];
      const fields = {
        'Faculty': 'faculty',
        'Coordinator': 'faculty',
        'Course': 'subject',
        'Course Title': 'subject',
        'Message': 'message',
        'Sent On': 'time'
      };
      for (let i=0; i<table.length; i++) {
        const rows = table[i].filter(e => allowed.indexOf(e[0]) > -1);
        while (rows.length > 0) {
          const message = {
            faculty: null,
            subject: null,
            message: null,
            time: null
          }
          for (let j=0; j<4; j++) {
            const row = rows.shift();
            const field = fields[row[0]];
            message[field] = row[2];
            if (field === 'time') {
              break;
            }
          }
          messages.push(message);
        }
      }
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
