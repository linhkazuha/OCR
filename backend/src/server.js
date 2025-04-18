import cors from "cors";
import express from 'express';
import routes from "./routes/index.js";
import { ocrWorker } from "./workers/worker.ocr.js";
import { translateWorker } from "./workers/worker.translate.js";
import { pdfWorker } from "./workers/worker.pdf.js";
import 'dotenv/config';
import { createUploadChannel } from "./utils/upload-amqs.js";
import { Server } from "socket.io";
import http from "http";

const app = express();
const port = 3001;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

app.use(cors());
app.use(express.json());
app.use("/file", routes());
app.get('/', (req, res) => {
    res.send('hehe');
});

// Start all Channel
createUploadChannel();
ocrWorker();
translateWorker();
pdfWorker();

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


// (async () => {
//     try {
//         const text = await ocr.image2text("./data/sample.png");
//         console.log(text);
//         const viText = await translate(text);
//         console.log(viText);
//         const pdfFile = createPDF(viText);
//         console.log("This is PDF file: " + pdfFile)
//     } catch (e) {
//         console.log(e);
//     }
// })();
