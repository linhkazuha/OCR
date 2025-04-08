/**
 * Xử lý văn bản OCR trước khi dịch
 * @param {string} text - Văn bản đầu vào từ OCR
 * @returns {string} Văn bản đã được xử lý
 */
function preprocessText(text) {
    // Bước 1: Xử lý từ bị ngắt dòng với dấu gạch ngang
    let processed = text.replace(/(\w+)-\n(\w+)/g, '$1$2');
    
    // Bước 2: Kết hợp các dòng bị ngắt không đúng chỗ
    // Chỉ nối dòng nếu không kết thúc bằng dấu câu (.!?)
    processed = processed.replace(/([^.!?])\n/g, '$1 ');
    
    // Bước 3: Bảo toàn ngắt đoạn văn (hai dòng trống liên tiếp)
    processed = processed.replace(/\n\s*\n/g, '\n\n');
    
    // Bước 4: Xử lý khoảng trắng dư thừa
    processed = processed.replace(/\s{2,}/g, ' ').trim();
    
    return processed;
  }
  
  export { preprocessText };