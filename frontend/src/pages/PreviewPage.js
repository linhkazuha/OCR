import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ImagePreview from '../components/ImagePreview';
import ActionButtons from '../components/ActionButtons';
import { v4 as uuidv4 } from 'uuid';

const PreviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (location.state && location.state.images) {
      setImages(location.state.images);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  const handleAddMoreImages = (newImages) => {
    const validImages = newImages.filter(img => img.size <= 2 * 1024 * 1024);
    
    if (validImages.length > 0) {
      setImages(prevImages => [...prevImages, ...validImages]);
    } else {
      alert('Please upload images that size not over 2MB');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    
    if (images.length === 1) {
      navigate('/');
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => 
        file.type === 'image/jpeg' || 
        file.type === 'image/jpg' || 
        file.type === 'image/png'
      );
      
      if (validFiles.length > 0) {
        // Tạo tên mặc định cho file kéo thả
        const filesWithCustomNames = validFiles.map(file => {
          const fileExtension = file.name.split('.').pop();
          const newFileName = `image_${uuidv4().slice(0, 8)}.${fileExtension}`;
          
          const renamedFile = new File([file], newFileName, { type: file.type });
          return renamedFile;
        });
        
        handleAddMoreImages(filesWithCustomNames);
      }
    }
  };

  return (
    <div className="preview-page">
      <Header />
      <div 
        className={`preview-container ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <ImagePreview 
          images={images} 
          onAddMoreImages={handleAddMoreImages}
          onRemoveImage={handleRemoveImage}
        />
        <ActionButtons 
          hasImages={images.length > 0} 
          totalImages={images.length}
          images={images} 
        />
      </div>
    </div>
  );
};

export default PreviewPage;