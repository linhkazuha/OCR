import amqplib from "amqplib";
import { translate } from "../utils/translate.js";
import 'dotenv/config';

const Translate_QUEUE = process.env.Translate_QUEUE_NAME;
const PDF_QUEUE = process.env.PDF_QUEUE_NAME;
const CloudAMQP_URL = process.env.CloudAMQP_URL;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export const translateWorker = async () => {
    const connection = await amqplib.connect(CloudAMQP_URL);
  
    const channel = await connection.createChannel();

    await channel.assertQueue(Translate_QUEUE);
    await channel.assertQueue(PDF_QUEUE);

    channel.consume(Translate_QUEUE, async (msg) => {
      //console.log(msg);
      if (msg !== null) {
        const { text, fileName, taskId } = JSON.parse(msg.content.toString());

        const translatedText = await translate(text);
        
        // await delay(5000);
        
        channel.sendToQueue(PDF_QUEUE, Buffer.from(JSON.stringify({ translatedText, fileName, taskId })), {
          persistent: true,
        });
        
        channel.ack(msg);
      }
    });
};

// translateWorker();
