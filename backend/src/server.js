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
// import { setSocketInstance } from './utils/socket.js';
import { setSocketInstance, getSocketInstance } from './utils/socket.js';
import pm2 from 'pm2';

const app = express();
const port = 3001;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
});

setSocketInstance(io);

app.use(cors());
app.use(express.json());
app.use("/file", routes());
app.get('/', (req, res) => {
    res.send('hehe');
});

// Start all Channel
createUploadChannel();
// ocrWorker();
// translateWorker();
// pdfWorker();

if (process.env.RUN_WORKERS_SEPARATELY !== 'true') {
  console.log("Starting workers within API server process...");
  ocrWorker();
  translateWorker();
  pdfWorker();
} else {
  console.log("Workers are expected to run in separate processes.");
  pm2.launchBus((err, pm2_bus) => {
    if (err) {
        return console.error(`[API Server - PID: ${process.pid}] PM2 launchBus Error:`, err);
    }
    console.log(`[API Server - PID: ${process.pid}] PM2 Bus connected successfully. Attaching listeners...`); // Thêm log

    // Log all message
    pm2_bus.on('process:msg', (packet) => {
        console.log(`[API Server - PID: ${process.pid}] DEBUG: Received raw packet on process:msg`, packet); // Log mọi thứ nhận được

        if (packet && packet.raw && packet.raw.topic === 'socket:event' && packet.raw.data) {
          console.log(`[API Server - PID: ${process.pid}] Received IPC message from ${packet.process?.name} (ID: ${packet.process?.pm_id}):`, packet.raw.data); // Log the actual data

          // Extract event and payload from packet.raw.data
          const { event, payload } = packet.raw.data;
          const currentIo = getSocketInstance();

          if (currentIo && event && payload) {
              // Use curly braces for string interpolation consistency
              console.log(`[API Server - PID: ${process.pid}] Emitting Socket.IO event '${event}' via IPC bridge.`);
              currentIo.emit(event, payload);
          } else {
              console.warn(`[API Server - PID: ${process.pid}] Cannot emit socket event from IPC. Missing io, event, or payload.`, { ioExists: !!currentIo, event, payload });
          }
      } else {
           // Log if the packet or packet.raw structure is wrong, showing the actual topic found if possible
           console.warn(`[API Server - PID: ${process.pid}] Received packet on process:msg, but not expected format. Expected topic 'socket:event' inside packet.raw. Topic found: ${packet?.raw?.topic}`, packet);
      }
    });

    pm2_bus.on('error', (error) => {
        console.error(`[API Server - PID: ${process.pid}] PM2 Bus Error:`, error);
    });

    console.log(`[API Server - PID: ${process.pid}] Listeners attached successfully.`); // Thêm log xác nhận
  });
}

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

export { io };

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
