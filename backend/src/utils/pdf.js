import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createPDF(text, file_Name) {
    // Tạo thư mục output nếu chưa tồn tại
    const outputDir = path.join(__dirname, '..', '..', 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Tạo tên file duy nhất với timestamp
    const timestamp = new Date().getTime();
    const fileName = `${file_Name}.pdf`;
    const outputPath = path.join(outputDir, fileName);
    
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    
    // Xử lý sự kiện khi stream đóng
    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
            resolve(outputPath);
        });
        
        stream.on('error', (err) => {
            reject(err);
        });
        
        doc.pipe(stream);
        
        const fontPath = path.join(__dirname, '..', 'font', 'Roboto-Regular.ttf');
        
        // Kiểm tra font tồn tại
        if (fs.existsSync(fontPath)) {
            doc.font(fontPath);
        } else {
            console.warn("Font file not found, using default font");
        }
        
        doc.fontSize(14)
           .text(text, 100, 100);
        
        doc.end();
    });
}

export { createPDF };