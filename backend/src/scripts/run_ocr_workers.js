import { ocrWorker } from '../workers/worker.ocr.js';
import { setSocketInstance } from '../utils/socket.js';

// console.log("Starting OCR workers...");
// ocrWorker();

const fakeIO = {
    emit: (event, data) => {
      console.log(`[MOCK EMIT] ${event}:`, data);
    }
};
  
setSocketInstance(fakeIO);
  
ocrWorker();