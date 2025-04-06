import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUT_FILE = "./output/output.pdf";
const fontPath = path.join(__dirname, '..', 'font', 'Roboto-Regular.ttf');

function createPDF(text) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(OUT_FILE));
    doc.font(fontPath)
        .fontSize(14)
        .text(text, 100, 100);
    doc.end();
    return OUT_FILE;
}

export { createPDF };