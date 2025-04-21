import React, { useRef, useState } from 'react';

const ImagePreview = ({ images, onAddMoreImages, onRemoveImage }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!images || images.length === 0) {
    return null;
  }

  const handleAddMoreClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0 && onAddMoreImages) {
      const files = Array.from(e.target.files);
      // giữ nguyên tên
      onAddMoreImages(files);
    }
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onAddMoreImages) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => 
        file.type === 'image/jpeg' || 
        file.type === 'image/jpg' || 
        file.type === 'image/png'
      );
      
      if (validFiles.length > 0) {
        onAddMoreImages(validFiles);
      }
    }
  };

  return (
    <div className="image-preview-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".jpg,.jpeg,.png"
        multiple
        style={{ display: 'none' }}
      />
      <div className="images-grid">
        {images.map((image, index) => (
          <div key={index} className="image-item">
            <div className="image-container">
              <img 
                src={URL.createObjectURL(image)} 
                alt={`Preview ${index + 1}`} 
              />
              <button 
                className="remove-image-btn"
                onClick={() => onRemoveImage(index)}
                title="Remove image"
              >
                ×
              </button>
            </div>
            <div className="image-info">
              <span>{image.name || `text${index + 1}.png`}</span>
              <span className="file-size">{(image.size / (1024 * 1024)).toFixed(1)}MB</span>
            </div>
          </div>
        ))}
        
        <div 
          className={`add-more-images ${isDragging ? 'dragging' : ''}`}
          onClick={handleAddMoreClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="add-icon">+</div>
          <span>add images</span>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;