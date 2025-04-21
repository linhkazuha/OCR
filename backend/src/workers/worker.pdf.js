import amqplib from "amqplib";
import { createPDF } from "../utils/pdf.js";
import 'dotenv/config';
import { io } from "../server.js";
import fs from "fs";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PDF_QUEUE = process.env.PDF_QUEUE_NAME;
const RESULT_QUEUE = process.env.RESULT_QUEUE_NAME;
const CloudAMQP_URL = process.env.CloudAMQP_URL;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const pdfWorker = async () => {
    const connection = await amqplib.connect(CloudAMQP_URL);
  
    const channel = await connection.createChannel();

    await channel.assertQueue(PDF_QUEUE);
    await channel.assertQueue(RESULT_QUEUE);

    channel.consume(PDF_QUEUE, async (msg) => {
      if (msg !== null) {
        console.log('PDF worker nhận message:', msg.content.toString());
        const { translatedText, fileName, taskId, requestedAt } = JSON.parse(msg.content.toString());

        // bắt đầu tạo PDF
        io.emit("process-update", { 
          fileName, 
          taskId, 
          stage: "pdf",
          status: "start"
        });

        try {
          const outputFileName = `${taskId}_${fileName.replace(/\.[^/.]+$/, "")}.pdf`;
          const outputFilePath = await createPDF(translatedText, fileName);
          
          const processingTime = Date.now() - requestedAt;
          const logLine = `${processingTime}\n`;
          
          try {
            const logDir = path.join(__dirname, '..', 'logs');
            if (!fs.existsSync(logDir)) {
              fs.mkdirSync(logDir, { recursive: true });
            }
            fs.appendFileSync(path.join(logDir, 'processing_times.csv'), logLine);
          } catch (logError) {
            console.error('Lỗi khi ghi log:', logError);
          }
    
          console.log(`PDF đã tạo thành công: ${outputFilePath}, thời gian xử lý: ${processingTime}ms`);
          
          // PDF đã sẵn sàng
          io.emit("process-update", { 
            fileName, 
            taskId, 
            stage: "pdf",
            status: "complete"
          });
          
          io.emit("url-ready", { 
            outputFilePath,
            processingTime,
            fileName,
            taskId
          });
          
          channel.ack(msg);
        } catch (error) {
          console.error('Lỗi khi tạo PDF:', error);

          io.emit("process-error", { 
            fileName, 
            taskId, 
            stage: "pdf",
            error: error.message
          });
          
          channel.ack(msg);
        }
      }
    });
    
    console.log('PDF worker đã khởi động và sẵn sàng xử lý');
};
