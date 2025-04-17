import axios from 'axios';

const API_URL = 'http://localhost:3001';

const API = {
  API_URL, // Xuất API_URL để có thể truy cập từ các component khác
  
  /**
   * Upload image file for OCR and translation
   * @param {File} file - The image file to upload
   * @returns {Promise} - Promise with the upload result
   */
  uploadImage: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await axios.post(`${API_URL}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Get the download URL for a translated PDF file
   * @param {string} fileName - The name of the file to download
   * @returns {string} - The download URL
   */
  getDownloadUrl: (fileName) => {
    return `${API_URL}/file/download/${fileName}`;
  }
};

export default API;