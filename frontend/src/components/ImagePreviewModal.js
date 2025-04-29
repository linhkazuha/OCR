import React from 'react';

const ImagePreviewModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="image-preview-modal-overlay" onClick={onClose}>
      <div className="image-preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-preview-modal-close" onClick={onClose}>×</button>
        <div className="image-preview-modal-body">
          <img src={URL.createObjectURL(image)} alt={image.name} />
        </div>
        <div className="image-preview-modal-footer">
          <div className="image-preview-info">
            <span className="image-preview-name">{image.name}</span>
            <span className="image-preview-size">{(image.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;