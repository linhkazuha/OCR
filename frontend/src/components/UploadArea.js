import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

const UploadArea = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => 
        file.type === 'image/jpeg' || 
        file.type === 'image/jpg' || 
        file.type === 'image/png'
      );
      
      if (validFiles.length > 0 && onImageUpload) {
        // Tạo tên mặc định cho file kéo thả
        const filesWithCustomNames = validFiles.map(file => {
          // Tạo một đối tượng File mới với cùng dữ liệu nhưng tên mới
          const fileExtension = file.name.split('.').pop();
          const newFileName = `image_${uuidv4().slice(0, 8)}.${fileExtension}`;
          
          // Tạo một object File mới với tên file mới
          const renamedFile = new File([file], newFileName, { type: file.type });
          return renamedFile;
        });
        
        onImageUpload(filesWithCustomNames);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (onImageUpload) {
        // Giữ nguyên tên file upload
        onImageUpload(files);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className={`upload-area ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".jpg,.jpeg,.png"
        multiple
        style={{ display: 'none' }}
      />
      
      <button className="upload-button" onClick={handleButtonClick}>
        Upload images
      </button>
      
      <p className="drag-text">
        or drop it here<br />
        (only jpg, jpeg, png file is supported)<br />
        (image's size is not over 2MB)
      </p>
    </div>
  );
};

export default UploadArea;