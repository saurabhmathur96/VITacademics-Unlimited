const fs = require("fs");
const getPixels = require("get-pixels");
const ndarray = require('ndarray');
const Promise = require('bluebird');
const logger = require('winston');
const path = require("path");
const offsetMap = {
  "A": 19,
  "E": 20,
  "4": 20,
  "8": 22,
  "3": 22,
  "J": 21,
  "V": 21,
  "U": 22,
  "1": 21,
  "2": 21,
  "I": 21,
  "P": 19,
  "F": 21,
  "9": 23,
  "6": 21,
  "C": 21,
  "N": 21,
  "W": 22,
  "7": 21,
  "S": 19,
  "5": 21,
  "Z": 21,
  "Q": 20,
  "B": 21,
  "R": 21,
  "T": 21,
  "H": 21,
  "D": 21,
  "Y": 21,
  "X": 21,
  "M": 21,
  "K": 21,
  "L": 21,
  "G": 21
}

let filePath = path.join(__dirname, '..', '..', 'data', 'bitmaps.json');
var bitmaps = JSON.parse(fs.readFileSync(filePath, "UTF-8"))

function detectCharacter(image, shift, error) {
  const characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  for (let i = 0; i < characters.length; i++) {

    const character = characters[i];
    const bitmap = bitmaps[character];

    const offset = offsetMap[character] || 21

    let total = 0
    let matches = 0;
    const length = bitmap.length;
    const width = bitmap[0].length;
    for (let y = 0; y < length; y++) { // iterate along length
      for (let x = 0; x < width; x++) { // iterate along width
        if ((bitmap[y][x] == 255) && (x + shift < 150) && (x + shift >= 0)) {
          total += 1;
          if (image.get(y + offset, x + shift) <= 10) {
            matches += 1;
          }
        }
      }
    }

    if (total != 0 && (matches / (total + 1e-6)) > error) {
      return { 'character': character, 'width': width };
    }

  }
  return null;

}


function makeBW(pixels) {
  // Grayscale, L = R * 299/1000 + G * 587/1000 + B * 114/1000
  const height = pixels.shape[0]
  const width = pixels.shape[1];
  var bw = ndarray(new Uint8Array(height * width), [width, height]);
  for (let y = 0; y < pixels.shape[1]; y++) {
    for (let x = 0; x < pixels.shape[0]; x++) {
      const pixel = pixels.get(x, y, 0) * 0.299 + // Red
        pixels.get(x, y, 1) * 0.587 + // Green
        pixels.get(x, y, 2) * 0.114; // Blue
      // Ignoring the alpha value at index 3 since all are 255.
      bw.set(y, x, Math.ceil(pixel))
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
      const bw = makeBW(pixels);
      let characterRange = 0;
      let width = 0;
      let captcha = "";
     for (let iteration = 0; iteration < 6; iteration++) {
        let result = null;
        let error = 1;
        while (result === null && error > 0.79) {
            for (let x = 0; x < 20; x++) {
                result = detectCharacter(bw, width + x, error);
                if (result !== null) {
                    characterRange = result.width;
                    width += characterRange + x;
                    captcha += result.character;
                    break;
                }
            }
            error -= 0.05;
        }
        if (result === null) {
            break;
        }
      }
      return resolve(captcha);
    })
  });
}
