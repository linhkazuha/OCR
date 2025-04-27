import { pdfWorker } from '../workers/worker.pdf.js';
import { setSocketInstance } from '../utils/socket.js';

// console.log("Starting PDF workers...");
// pdfWorker();

// const fakeIO = {
//     emit: (event, data) => {
//       console.log(`[MOCK EMIT] ${event}:`, data);
//     }
// };
  
// setSocketInstance(fakeIO);

console.log(`[PID: ${process.pid}] Starting PDF worker instance...`);
pdfWorker();