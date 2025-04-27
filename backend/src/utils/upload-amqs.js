import amqplib from 'amqplib';
import 'dotenv/config';

const CLOUDAMQP_URL = process.env.CloudAMQP_URL;
const OCR_QUEUE = process.env.OCR_QUEUE_NAME;

let connection = null;
let channel = null;

export const createUploadChannel = async () => {
  if (!connection) {
    connection = await amqplib.connect(CLOUDAMQP_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(OCR_QUEUE, { durable: true });
  } else {
    console.log('channel is created successfully')
  }
};

export const getUploadChannel = () => {
  if (!channel) {
      throw new Error("Channel is not initialized. Call createUploadChannel() first.");
  }
  return channel;
};
