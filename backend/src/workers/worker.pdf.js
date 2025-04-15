import amqplib from "amqplib";
import { createPDF } from "../utils/pdf.js";
import 'dotenv/config';

const PDF_QUEUE = process.env.PDF_QUEUE_NAME;
const RESULT_QUEUE = process.env.RESULT_QUEUE_NAME;
const CloudAMQP_URL = process.env.CloudAMQP_URL;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export const pdfWorker = async () => {
    const connection = await amqplib.connect(CloudAMQP_URL);
  
    const channel = await connection.createChannel();

    await channel.assertQueue(PDF_QUEUE);
    await channel.assertQueue(RESULT_QUEUE);

    //each worker takes 1 message at a time
    channel.prefetch(1);
    console.log("PDF Worker: Prefetch count set to 1");

    channel.consume(PDF_QUEUE, async (msg) => {
      if (msg !== null) {
        console.log(msg);
        const { translatedText, fileName, taskId } = JSON.parse(msg.content.toString());

        const outputFileName = `${taskId}_${fileName.replace(/\.[^/.]+$/, "")}.pdf`;

        const outputFilePath = await createPDF(translatedText, fileName);
        
        console.log(`PDF created: ${outputFilePath}`);
        
        // await delay(5000);
        
        channel.sendToQueue(RESULT_QUEUE, Buffer.from(JSON.stringify({ outputFilePath, taskId })), {
          persistent: true,
        });
        
        channel.ack(msg);
      }
    });
};

// pdfWorker();
