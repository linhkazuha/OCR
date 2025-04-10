import amqplib from "amqplib";
import { image2text } from "../utils/ocr.js";

const OCR_QUEUE = process.env.OCR_QUEUE_NAME;
const Translate_QUEUE = process.env.Translate_QUEUE_NAME;
const CloudAMQP_URL = process.env.CloudAMQP_URL;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ocrWorker = async () => {
    const connection = await amqplib.connect(CloudAMQP_URL);
  
    const channel = await connection.createChannel();

    await channel.assertQueue(OCR_QUEUE);
    await channel.assertQueue(Translate_QUEUE);

    channel.consume(OCR_QUEUE, async (msg) => {
      if (msg !== null) {
        console.log(msg);
        const { filePath, fileName } = JSON.parse(msg.content.toString());

        const text = await image2text(filePath);
        
        // await delay(5000);
        
        channel.sendToQueue(Translate_QUEUE, Buffer.from(JSON.stringify({ text, fileName })), {
          persistent: true,
        });
        
        channel.ack(msg);
      }
    });
};

// ocrWorker();
