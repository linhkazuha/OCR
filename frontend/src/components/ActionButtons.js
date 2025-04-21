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
        console.log('Tải lên thành công:', data);
        
        navigate('/processing', { 
          state: { 
            images: images,
            taskId: data.taskId,
            requestedAt: Date.now() 
          } 
        });
      } else {
        console.error('Lỗi khi tải lên:', data.message);
        alert(`Lỗi: ${data.message}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Lỗi khi gửi request:', error);
      alert('Không thể kết nối đến server. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="action-container">
      {hasImages && (
        <div className="image-count">
          Số lượng ảnh: {totalImages}
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          className="process-button queue"
          disabled={!hasImages || loading}
          onClick={handleProcessWithQueue}
        >
          {loading ? 'Đang tải lên...' : 'Xử lý với Queue'}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;