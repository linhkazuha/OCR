import path from "path";
import fs from "fs";
import { image2text } from "../utils/ocr.js";
import { createPDF } from "../utils/pdf.js";
import { translate } from "../utils/translate.js";

const processFile = async (filePath) => {
    try {
        if (filePath == Promise) {
            console.log('filePath promise may ngu')
        }

        const text = await image2text(filePath);
        console.log("OCR Output:", text);

        const translatedText = await translate(text);
        console.log("Translated Text:", translatedText);

        const pdfPath = createPDF(translatedText);

        console.log("PDF Path:", pdfPath);

        fs.unlinkSync(filePath);

        return pdfPath;
    } catch (err) {
        throw new Error("Error processing file: " + err.message);
    }
};

export { processFile };