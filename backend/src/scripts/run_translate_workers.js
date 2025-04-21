import { translateWorker } from '../workers/worker.translate.js';
import { setSocketInstance } from '../utils/socket.js';

// console.log("Starting Translate workers...");
// translateWorker();

const fakeIO = {
    emit: (event, data) => {
      console.log(`[MOCK EMIT] ${event}:`, data);
    }
};
  
setSocketInstance(fakeIO);
  
translateWorker();