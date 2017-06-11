const cheerio = require('cheerio');
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
      for (let i = 0; i < table.length; i++) {
        const rows = table[i].filter(e => allowed.indexOf(e[0]) > -1);
        while (rows.length > 0) {
          const message = {
            faculty: null,
            subject: null,
            message: null,
            time: null
          }
          for (let j = 0; j < 4; j++) {
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
      const $ = cheerio.load(html);
      let current = { title: '', data: [] };
      let currentData = { link: '#', text: '' };
      const result = [];
      $('td').each((i, e) => {
        let item = $(e);
        const itemHTML = item.html().trim();
        const itemText = item.text().trim();
        let link = null;
        try {
          link = $(itemHTML).attr('href');
        } catch (error) {
          // ignore
        }

        if (itemHTML.indexOf('<b><u>') !== -1) {
          if (current.data.length > 0) {
            result.push(current);
          }
          current = { title: itemText, data: [] };
        } else {
          if (link !== null && link !== undefined) {
            current.data.push({
              link: link,
              text: currentData.text + itemText
            });
            currentData = { link: '#', text: '' };
          } else if (itemHTML === '<hr>' || itemHTML === '<hr/>') {
            if (currentData.text !== '') {
              current.data.push(currentData);
            }
            currentData = { link: '#', text: '' };
          } else {
            currentData.text += itemText;
          }
        }
      });
      return resolve(result);
    }
    catch (ex) {
      return reject(ex);
    }
  })
};
