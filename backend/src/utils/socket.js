let ioInstance = null;

export const setSocketInstance = (io) => {
  ioInstance = io;
  console.log(`[socket.js] Socket instance ${io ? 'set' : 'cleared'} in process PID: ${process.pid}`);
};

export const getSocketInstance = () => {
  if (!ioInstance) {
    console.warn(`[socket.js] Attempted to get socket instance before it was set in process PID: ${process.pid}`);
  }
  return ioInstance;
};
