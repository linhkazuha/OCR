import React, { useRef, useState } from 'react';

const UploadSection = ({ onFileSelected }) => {
  const [previewSrc, setPreviewSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // kiểm tra file có phải là ảnh
    if (!file.type.match('image.*')) {
      alert('Vui lòng chọn một file hình ảnh');
      return;
    }

    // tạo preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewSrc(e.target.result);
      onFileSelected(file);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="section">
      <div className="section-title">
        <span className="section-icon">⬆️</span>
        Upload your image
      </div>
      <div className="preview-container">
        {previewSrc ? (
          <img src={previewSrc} alt="Preview" className="preview-image" />
        ) : (
          <div className="preview-text">Preview Image</div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="file-input"
      />
      <button className="upload-btn" onClick={handleButtonClick}>
        Choose Image
      </button>
    </div>
  );
};

export default UploadSection;