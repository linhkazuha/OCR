import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ hasImages, totalImages, images }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProcessWithQueue = async () => {
    if (!hasImages || loading) return;
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      images.forEach(img => {
        formData.append('files', img);
      });
      
      const response = await fetch('http://localhost:3001/file/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Upload success:', data);
        
        navigate('/processing', { 
          state: { 
            images: images,
            taskId: data.taskId,
            requestedAt: Date.now() 
          } 
        });
      } else {
        console.error('Error:', data.message);
        alert(`Error: ${data.message}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Lỗi khi gửi request:', error);
      alert('Cannot connect with server. Please try again');
      setLoading(false);
    }
  };

  return (
    <div className="action-container">
      {hasImages && (
        <div className="image-count">
          Total images: {totalImages}
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          className="process-button queue"
          disabled={!hasImages || loading}
          onClick={handleProcessWithQueue}
        >
          {loading ? 'Uploading...' : 'Process with Queue'}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;