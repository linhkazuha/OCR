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
        //console.log(msg);
        const { translatedText, fileName, taskId, requestedAt } = JSON.parse(msg.content.toString());

        const outputFileName = `${taskId}_${fileName.replace(/\.[^/.]+$/, "")}.pdf`;

        const outputFilePath = await createPDF(translatedText, fileName);
        
        const logLine = `${Date.now() - requestedAt}\n`;
        fs.appendFileSync(path.join(__dirname, '..', 'logs', 'processing_times.csv'), logLine);
        
        //console.log(`PDF created: ${outputFilePath}`);
        
        // await delay(5000);

        io.emit("url-ready", outputFilePath);
        // console.log("PDF ready at:", Date.now() - requestedAt,"ms");
        
        channel.ack(msg);
      }
    });
};

// pdfWorker();
