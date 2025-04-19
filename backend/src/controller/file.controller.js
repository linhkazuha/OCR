import uploadFile from "../middlewares/upload.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import amqplib from 'amqplib';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { getUploadChannel } from "../utils/upload-amqs.js";
import { processFile } from "../services/ocr.service.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const upload_without_queue = async (req, res) => {
    const requestedAt = Date.now();

    uploadFile(req, res, async (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).send({
                message: `File upload error: ${err.message}`,
            });
        }
        if (!req.files) {
            return res.status(400).send({ message: "Please upload at least file!" });
        }

        try {
            const pdfUrls = [];

            for (const file of req.files) {
                const pdfPath = await processFile(file.path, file.filename);
                pdfUrls.push(pdfPath);
                const logLine = `${Date.now() - requestedAt}\n`;
                fs.appendFileSync(path.join(__dirname, '..', 'logs', 'withoutQueue_processing_times.csv'), logLine);
            }


            res.json({
                message: "All files uploaded and processed successfully!",
                pdfUrls,
            });
        } catch (err) {
            res.status(500).send({
                message: `Could not process the file: ${req.file?.originalname}. ${err}`,
            });
        }
    });
};

// Message Queue
const CloudAMQP_URL = process.env.CloudAMQP_URL;
const OCR_QUEUE = process.env.OCR_QUEUE_NAME;

const upload = async (req, res) => {
    const requestedAt = Date.now();
    uploadFile(req, res, async (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).send({
                message: `File upload error: ${err.message}`,
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ message: "Please upload at least one file!" });
        }

        try {

            const channel = getUploadChannel();
            
            channel.assertQueue(OCR_QUEUE, {
                durable: true,
            })

            const taskId = uuidv4();

            for (const file of req.files) {
                const payload = {
                    taskId,
                    filePath: file.path,
                    fileName: file.filename,
                    requestedAt,
                };

                //console.log(`Sending file to OCR queue:`, payload);

                channel.sendToQueue(OCR_QUEUE, Buffer.from(JSON.stringify(payload)), {
                    persistent: true,
                });
            }

            res.status(200).json({
                message: "All files uploaded and sent for processing.",
                taskId,
                files: req.files.map(f => f.originalname),
            });
        } catch (err) {
            console.error("Queue error:", err);
            res.status(500).send({
                message: `Could not queue the files. ${err}`,
            });
        }
    });
};

const download = (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, "..", "..", "output", fileName);

    res.download(filePath, (err) => {
        if (err) {
            res.status(500).send({
                message: "Could not download the file. " + err,
            });
        }
    });
};

export default {
    upload_without_queue,
    upload,
    download
};