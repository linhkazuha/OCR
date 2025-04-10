import amqplib from "amqplib";
import { createPDF } from "../utils/pdf.js";

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
        console.log(msg);
        const { translatedText, fileName } = JSON.parse(msg.content.toString());

        const outputFilePath = await createPDF(translatedText, fileName);
        
        console.log(`PDF created: ${outputFilePath}`);
        
        // await delay(5000);
        
        channel.sendToQueue(RESULT_QUEUE, Buffer.from(JSON.stringify({ outputFilePath })), {
          persistent: true,
        });
        
        channel.ack(msg);
      }
    });
};

// pdfWorker();
