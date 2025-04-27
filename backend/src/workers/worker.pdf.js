import amqplib from "amqplib";
import { createPDF } from "../utils/pdf.js";
import 'dotenv/config';
// import { io } from "../server.js";
import fs from "fs";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { getSocketInstance } from "../utils/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PDF_QUEUE = process.env.PDF_QUEUE_NAME;
const RESULT_QUEUE = process.env.RESULT_QUEUE_NAME;
const CloudAMQP_URL = process.env.CloudAMQP_URL;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendSocketEvent = (event, data) => {
  // Ưu tiên dùng PM2 IPC nếu có
  if (typeof process.send === 'function') {
      const message = {
          topic: 'socket:event',
          data: { event: event, payload: data }
      };
      console.log(`[PID: ${process.pid} - PDF Worker] Sending via IPC:`, JSON.stringify(message.data));
      process.send(message);
  }
  // Nếu không có IPC, thử emit trực tiếp (cho mode node server.js)
  else {
      const io = getSocketInstance(); // Lấy instance từ tiến trình chính (nếu có)
      if (io) {
           console.log(`[PID: ${process.pid} - PDF Worker] Emitting directly via Socket.IO: ${event}`);
          io.emit(event, data);
      } else {
          // Cảnh báo nếu không thể gửi bằng cả hai cách
          console.warn(`[PID: ${process.pid} - PDF Worker] Cannot send event: process.send unavailable AND Socket.IO instance is null.`);
      }
  }
};

export const pdfWorker = async () => {
    const connection = await amqplib.connect(CloudAMQP_URL);
  
    const channel = await connection.createChannel();

    await channel.assertQueue(PDF_QUEUE);
    await channel.assertQueue(RESULT_QUEUE);

    // //each worker takes 2 message at a time
    // channel.prefetch(2);
    // console.log("PDF Worker: Prefetch count set to 2");

    channel.consume(PDF_QUEUE, async (msg) => {
      if (msg !== null) {
        console.log('PDF worker nhận message:', msg.content.toString());
        const { translatedText, fileName, taskId, requestedAt } = JSON.parse(msg.content.toString());
        // const io = getSocketInstance();
        // if (!io) {
        //   console.warn("Socket instance is null — unable to emit events");
        // }

        // // bắt đầu tạo PDF
        // io.emit("process-update", { 
        //   fileName, 
        //   taskId, 
        //   stage: "pdf",
        //   status: "start"
        // });

        sendSocketEvent("process-update", { 
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
          console.log(`[PDF Worker] requestedAt: ${requestedAt}, processingTime: ${processingTime}`);
          
          try {
            const logDir = path.join(__dirname, '..', 'logs');
            console.log("[PDF Worker] Ghi log vào:", logDir);
            if (!fs.existsSync(logDir)) {
              fs.mkdirSync(logDir, { recursive: true });
            }
            fs.appendFileSync(path.join(logDir, 'processing_times.csv'), logLine);
          } catch (logError) {
            console.error('Lỗi khi ghi log:', logError);
          }
    
          console.log(`PDF đã tạo thành công: ${outputFilePath}, thời gian xử lý: ${processingTime}ms`);
          
          // // PDF đã sẵn sàng
          // io.emit("process-update", { 
          //   fileName, 
          //   taskId, 
          //   stage: "pdf",
          //   status: "complete"
          // });
          
          // io.emit("url-ready", { 
          //   outputFilePath,
          //   processingTime,
          //   fileName,
          //   taskId
          // });

          sendSocketEvent("process-update", { 
            fileName, 
            taskId, 
            stage: "pdf",
            status: "complete"
          });
          
          sendSocketEvent("url-ready", { 
            outputFilePath,
            processingTime,
            fileName,
            taskId
          });
          
          channel.ack(msg);
        } catch (error) {
          console.error('Lỗi khi tạo PDF:', error);

          // io.emit("process-error", { 
          //   fileName, 
          //   taskId, 
          //   stage: "pdf",
          //   error: error.message
          // });

          sendSocketEvent("process-error", { 
            fileName, 
            taskId, 
            stage: "pdf",
            error: error.message
          });
          
          channel.ack(msg);
        }
      }
    });
    
    // console.log('PDF worker đã khởi động và sẵn sàng xử lý');
};
