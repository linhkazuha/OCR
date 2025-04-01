const tesseract = require("node-tesseract-ocr");
require('dotenv').config();

async function image2text(path) {
  const tesseractPath = process.env.TESSERACT_PATH;
  
  const config = {
    lang: "eng",
    binary: tesseractPath ? `"${tesseractPath}"` : undefined
  };
  
  return await tesseract.recognize(path, config);
}

module.exports = {
  image2text
}