import amqplib from "amqplib";
import { image2text } from "../utils/ocr.js";
import 'dotenv/config';
// import { io } from "../server.js";
import { getSocketInstance } from "../utils/socket.js";

const OCR_QUEUE = process.env.OCR_QUEUE_NAME;
const Translate_QUEUE = process.env.Translate_QUEUE_NAME;
const CloudAMQP_URL = process.env.CloudAMQP_URL;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ocrWorker = async () => {
    const connection = await amqplib.connect(CloudAMQP_URL);
    // console.log(OCR_QUEUE)
    // console.log(CloudAMQP_URL)
    // console.log(Translate_QUEUE)
  
    const channel = await connection.createChannel();

    await channel.assertQueue(OCR_QUEUE);
    await channel.assertQueue(Translate_QUEUE);

    //each worker takes 1 message at a time
    channel.prefetch(1);
    console.log("OCR Worker: Prefetch count set to 1");

    channel.consume(OCR_QUEUE, async (msg) => {
      if (msg !== null) {
        //console.log(msg);
        try {
          const { filePath, fileName, taskId, requestedAt } = JSON.parse(msg.content.toString());
          const io = getSocketInstance();
          if (!io) {
            console.warn("Socket instance is null — unable to emit events");
          }
          
          // Thông báo bắt đầu OCR
          io.emit("process-update", { 
            fileName, 
            taskId, 
            stage: "ocr",
            status: "start"
          });
    
          const text = await image2text(filePath);
          
          // Thông báo hoàn thành OCR
          io.emit("process-update", { 
            fileName, 
            taskId, 
            stage: "ocr",
            status: "complete"
          });        
        
          
          channel.sendToQueue(Translate_QUEUE, Buffer.from(JSON.stringify({ text, fileName, taskId, requestedAt })), {
            persistent: true,
          });
          
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing OCR:', error);
          
          // Emit process error
          io.emit("process-error", { 
            taskId, 
            fileName, 
            stage: "ocr",
            status: "error",
            error: error.message 
          });
  
          // Acknowledge message in case of error, so RabbitMQ won't keep re-queuing it
          channel.ack(msg);
      }
    }
    });
};

// ocrWorker();
