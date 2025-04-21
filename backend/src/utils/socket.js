let ioInstance = null;

export const setSocketInstance = (io) => {
  ioInstance = io;
};

export const getSocketInstance = () => {
  return ioInstance;
};
