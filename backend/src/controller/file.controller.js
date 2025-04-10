import uploadFile from "../middlewares/upload.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import amqplib from 'amqplib';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const upload = async (req, res) => {
//     uploadFile(req, res, async (err) => {
//         if (err) {
//             console.error("Multer error:", err);
//             return res.status(400).send({
//                 message: `File upload error: ${err.message}`,
//             });
//         }
//         if (!req.file) {
//             return res.status(400).send({ message: "Please upload a file!" });
//         }

//         try {
//             const pdfPath = await processFile(req.file.path);  
//             res.json({
//                 message: "Uploaded and processed successfully!",
//                 pdfUrl: `/output/${path.basename(pdfPath)}`,
//             });
//         } catch (err) {
//             res.status(500).send({
//                 message: `Could not process the file: ${req.file?.originalname}. ${err}`,
//             });
//         }
//     });
// };

// Message Queue
const CloudAMQP_URL = process.env.CloudAMQP_URL;
const OCR_QUEUE = process.env.OCR_QUEUE_NAME;

const upload = async (req, res) => {
    uploadFile(req, res, async (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).send({
                message: `File upload error: ${err.message}`,
            });
        }
        if (!req.file) {
            return res.status(400).send({ message: "Please upload a file!" });
        }

        try {
            const connection = await amqplib.connect(CloudAMQP_URL);

            const channel = await connection.createChannel();
            
            channel.assertQueue(OCR_QUEUE, {
                durable: true,
            })

            const payload = {
                filePath: req.file.path,
                fileName: req.file.filename,
            };

            console.log(req.file.filename);

            channel.sendToQueue(OCR_QUEUE, Buffer.from(JSON.stringify(payload)));

            res.json({
                message: "Uploaded successfully. Processing in background...",
            });
        } catch (err) {
            res.status(500).send({
                message: `Could not process the file: ${req.file?.originalname}. ${err}`,
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
    upload,
    download
};