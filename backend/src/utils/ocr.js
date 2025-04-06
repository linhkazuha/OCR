import tesseract from "node-tesseract-ocr";

async function image2text(path){
  return await tesseract.recognize(path, {
    lang: "eng"
  })
}

export { image2text };

