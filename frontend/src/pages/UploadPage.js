import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import UploadArea from '../components/UploadArea';

const UploadPage = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImageUpload = (files) => {
    const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024);
    
    if (validFiles.length > 0) {
      setUploadedImages(validFiles);
      
      navigate('/preview', { state: { images: validFiles } });
    } else {
      alert('Please upload images less than 2MB');
    }
  };

  return (
    <div className="upload-page">
      <Header />
      <div className="upload-container">
        <UploadArea onImageUpload={handleImageUpload} />
      </div>
    </div>
  );
};

export default UploadPage;