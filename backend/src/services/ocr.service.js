import path from "path";
import fs from "fs";
import { image2text } from "../utils/ocr.js";
import { createPDF } from "../utils/pdf.js";
import { translate } from "../utils/translate.js";
import { preprocessText } from "../utils/textProcessor.js";

const processFile = async (filePath, fileName) => {
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }

        const text = await image2text(filePath);
        // console.log("OCR Output (original):", text);

        const processedText = preprocessText(text);
        // console.log("OCR Output (processed):", processedText);

        const translatedText = await translate(processedText);
        // console.log("Translated Text:", translatedText);

        const pdfPath = await createPDF(translatedText, fileName);
        // console.log("PDF Path:", pdfPath);

        fs.unlinkSync(filePath);
        // console.log(pdfPath);

        return pdfPath;
    } catch (err) {
        throw new Error("Error processing file: " + err.message);
    }
};

export { processFile };