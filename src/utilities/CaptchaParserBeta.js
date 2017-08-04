const fs = require("fs");
const getPixels = require("get-pixels");
const ndarray = require('ndarray');
const Promise = require('bluebird');
const logger = require('winston');
const path = require("path");


let filePath = path.join(__dirname, '..', '..', 'data', 'bitmaps.json');
var bitmaps = JSON.parse(fs.readFileSync(filePath, "UTF-8"))




function makeBW(pixels) {
  // Grayscale, L = R * 299/1000 + G * 587/1000 + B * 114/1000
  const height = pixels.shape[0],
    width = pixels.shape[1];
  var bw = ndarray(new Uint8Array(height * width), [height, width]);
  for (let x = 0; x < pixels.shape[0]; x++) {
    for (let y = 0; y < pixels.shape[1]; y++) {
      const pixel = pixels.get(x, y, 0) * 0.299 + // Red
        pixels.get(x, y, 1) * 0.587 + // Green
        pixels.get(x, y, 2) * 0.114; // Blue
      // Ignoring the alpha value at index 3 since all are 255.
      bw.set(x, y, pixel);
    }
  }
  return bw;
}


module.exports.getCaptcha = (url) => {
  return new Promise((resolve, reject) => {
    getPixels(url, (err, pixels) => {
      if (err) {
        logger.error(err);
        return reject(new Error('Error in parsing captcha.'));
      }
      pixels = makeBW(pixels);
      for (let y = 1; y < 44; y++) {
        for (let x = 1; x < 179; x++) {
          const condition1 = (pixels.get(x, y - 1) === 255) && (pixels.get(x, y) === 0) && (pixels.get(x, y + 1) === 255);
          const condition2 = (pixels.get(x - 1, y) === 255) && (pixels.get(x, y) == 0) && (pixels[x + 1, y] === 255);
          const condition3 = (pixels.get(x, y) !== 255) && (pixels.get(x, y) !== 0);
          if (condition1 || condition2 || condition3) {
            pixels.set(x, y, 255);
          }
        }
      }
      let captcha = "";
      for (let s = 30; s < 181; s += 30) {
        let matches = [];
        const chars = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
        for (let c = 0; c < chars.length; c++) {
          const current = chars[c];
          let match = 0;
          let black = 0;
          const bitmap = bitmaps[current];
          for (let x = 0; x < 32; x++) {
            for (let y = 0; y < 30; y++) {
              const x1 = y + s - 30
              const y1 = x + 12
              if ((pixels.get(x1, y1) === bitmap[x][y]) && (bitmap[x][y] == 0)) {
                match += 1;
              }
              if (bitmap[x][y] == 0) {
                black += 1;
              }
            }
          }
          if (match / black >= 0.80) {
            const percent = match / black;
            matches.push([percent, current]);
          }
        }
        captcha += matches.reduce(function(a, b)  {
          return a[0] > b[0] ? a : b
        }, [0, 0])[1];
      }
      return resolve(captcha);
    })
  });
}
