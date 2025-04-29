import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import io from 'socket.io-client';
import ImagePreviewModal from '../components/ImagePreviewModal';

const ProcessingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState({});
  const [results, setResults] = useState({});
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const STAGES = {
    WAITING: 'waiting',
    OCR: 'ocr',
    TRANSLATING: 'translating',
    PDF: 'pdf',
    COMPLETED: 'completed'
  };

  useEffect(() => {
    if (!location.state || !location.state.images || !location.state.taskId) {
      console.log('Không có dữ liệu hợp lệ, chuyển hướng về trang chủ');
      navigate('/');
      return;
    }

    console.log('Nhận được thông tin:', {
      taskId: location.state.taskId,
      imageCount: location.state.images.length,
      imageNames: location.state.images.map(img => img.name)
    });

    setImages(location.state.images);
    
    const initialProcessing = {};
    location.state.images.forEach(image => {
      initialProcessing[image.name] = STAGES.WAITING;
    });
    setProcessing(initialProcessing);
  
    // Khởi tạo kết nối Socket.IO
    console.log('Đang kết nối Socket.IO...');
    const newSocket = io('http://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('Socket đã kết nối thành công, ID:', newSocket.id);
      setSocketConnected(true);
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Socket đã ngắt kết nối:', reason);
      setSocketConnected(false);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Lỗi kết nối Socket.IO:', error);
    });
    
    newSocket.on('process-update', (data) => {
      console.log('Nhận sự kiện process-update:', data);
      
      if (!data) {
        console.warn('Nhận được dữ liệu rỗng từ sự kiện process-update');
        return;
      }
      
      const { fileName, stage, status, taskId } = data;
      
      // Kiểm tra taskId
      if (taskId && taskId !== location.state.taskId) {
        console.log('Bỏ qua sự kiện process-update vì không khớp taskId');
        return;
      }
      
      if (!fileName) {
        console.warn('Sự kiện process-update không có fileName');
        return;
      }
      
      let matchedImageName = null;
      
      for (const image of location.state.images) {
        if (!image || !image.name) continue;
        
        if ((fileName && fileName.includes(image.name)) || 
            (image.name && image.name.includes(fileName))) {
          matchedImageName = image.name;
          break;
        }
      }
      
      if (matchedImageName) {
        console.log(`Tìm thấy ảnh khớp cho "${fileName}": "${matchedImageName}"`);
        
        // Cập nhật trạng thái xử lý
        if (status === 'start') {
          setProcessing(prev => {
            const newState = {
              ...prev,
              [matchedImageName]: stage === 'ocr' ? STAGES.OCR : 
                               stage === 'translating' ? STAGES.TRANSLATING : 
                               stage === 'pdf' ? STAGES.PDF : prev[matchedImageName]
            };
            console.log('Cập nhật trạng thái xử lý:', newState);
            return newState;
          });
        } else if (status === 'complete') {
          console.log(`Giai đoạn ${stage} hoàn thành cho "${matchedImageName}"`);
        }
      } else {
        console.warn(`Không tìm thấy ảnh khớp cho fileName: "${fileName}"`);
      }
    });
    
    // Xử lý kết quả hoàn thành
    newSocket.on('url-ready', (data) => {
      console.log('Nhận sự kiện url-ready:', data);
      
      if (typeof data === 'string') {
        console.log('Nhận được url-ready với dữ liệu dạng string:', data);
        const outputFilePath = data;
        const resultFileName = outputFilePath.split('/').pop();
        
        if (location.state.images.length > 0) {
          const firstImageName = location.state.images[0].name;
          setResults(prev => ({
            ...prev,
            [firstImageName]: {
              fileName: resultFileName,
              downloadUrl: `http://localhost:3001/file/download/${resultFileName}`,
              timestamp: new Date(),
              isSample: false
            }
          }));
          
          setProcessing(prev => ({
            ...prev,
            [firstImageName]: STAGES.COMPLETED
          }));
        }
        return;
      }
      
      if (!data || typeof data !== 'object') {
        console.warn('Nhận được dữ liệu không hợp lệ từ sự kiện url-ready');
        return;
      }
      
      const { outputFilePath, processingTime, fileName, taskId } = data;
      
      // Kiểm tra taskId
      if (taskId && taskId !== location.state.taskId) {
        console.log('Bỏ qua sự kiện url-ready vì không khớp taskId');
        return;
      }
      
      if (!outputFilePath) {
        console.warn('Sự kiện url-ready không có outputFilePath');
        return;
      }
      
      const resultFileName = outputFilePath.split(/[/\\]/).pop();
      console.log('đường dẫn file:', outputFilePath, "--------------");
      console.log('tên file:', resultFileName, "--------------");

      let matchedImageName = null;
      
      // Nếu có fileName, tìm ảnh khớp
      if (fileName) {
        for (const image of location.state.images) {
          if (!image || !image.name) continue;
          
          if ((fileName && fileName.includes(image.name)) || 
              (image.name && image.name.includes(fileName))) {
            matchedImageName = image.name;
            break;
          }
        }
      }
      
      // Nếu không tìm thấy qua fileName, thử tìm qua resultFileName
      if (!matchedImageName) {
        for (const image of location.state.images) {
          if (!image || !image.name) continue;
          
          if (resultFileName.includes(image.name) || image.name.includes(resultFileName)) {
            matchedImageName = image.name;
            break;
          }
        }
      }
      
      // Nếu vẫn không tìm thấy và chỉ có 1 ảnh, giả định đó là ảnh cần cập nhật
      if (!matchedImageName && location.state.images.length === 1) {
        matchedImageName = location.state.images[0].name;
      }
      
      if (matchedImageName) {
        console.log(`Tìm thấy ảnh khớp cho kết quả: "${matchedImageName}"`);
        
        // Cập nhật kết quả
        setResults(prev => {
          const newResults = {
            ...prev,
            [matchedImageName]: {
              fileName: resultFileName,
              downloadUrl: `http://localhost:3001/file/download/${resultFileName}`,
              timestamp: new Date(),
              processingTime: processingTime,
              isSample: false
            }
          };
          console.log('Cập nhật kết quả:', newResults);
          return newResults;
        });
        
        setProcessing(prev => {
          const newState = {
            ...prev,
            [matchedImageName]: STAGES.COMPLETED
          };
          console.log('Cập nhật trạng thái hoàn thành:', newState);
          return newState;
        });
      } else {
        console.warn(`Không tìm thấy ảnh khớp cho kết quả: "${resultFileName}"`);
      }
    });
    
    setSocket(newSocket);
    
    return () => {
      console.log('Ngắt kết nối Socket.IO...');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [location, navigate]);

  const getProgressPercentage = (stage) => {
    switch(stage) {
      case STAGES.WAITING: return 0;
      case STAGES.OCR: return 25;
      case STAGES.TRANSLATING: return 50;
      case STAGES.PDF: return 75;
      case STAGES.COMPLETED: return 100;
      default: return 0;
    }
  };

  const getStageText = (stage) => {
    switch(stage) {
      case STAGES.WAITING: return 'waiting';
      case STAGES.OCR: return 'OCR';
      case STAGES.TRANSLATING: return 'translating';
      case STAGES.PDF: return 'pdf';
      case STAGES.COMPLETED: return 'completed';
      default: return 'undefined';
    }
  };

  const isAllCompleted = () => {
    return images.length > 0 && images.every(image => processing[image.name] === STAGES.COMPLETED);
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handleSampleClick = (e, isSample) => {
    if (isSample) {
      e.preventDefault();
      alert('Đây là file mẫu cho mục đích demo. Trong thực tế, liên kết này sẽ tải xuống file PDF thực từ server.');
    }
  };
  
  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy quá trình xử lý này?')) {
      navigate('/');
    }
  };

  const handleImagePreview = (image) => {
    setPreviewImage(image);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <div className="processing-page">
      <Header />
      <div className="processing-container">
        <div className="processing-header">
          <h2>Process with Queue</h2>
          <div className="task-id-info">
            Task ID: <span className="task-id-value">{location.state?.taskId}</span>
            <span className="socket-status" style={{ 
              marginLeft: '10px', 
              color: socketConnected ? 'green' : 'red',
              fontSize: '12px'
            }}>
              {socketConnected ? '(connected)' : '(disconnect)'}
            </span>
          </div>
        </div>
        
        <div className="processing-table">
          {/* Tiêu đề cột */}
          <div className="processing-table-header">
            <div className="column-header source-header">Images</div>
            <div className="column-header progress-header">Process</div>
            <div className="column-header result-header">Results</div>
          </div>
          
          {/* Nội dung bảng - mỗi hàng là một file */}
          {images.map((image, index) => (
            <div key={index} className="processing-table-row">
              {/* Cột hình ảnh gốc */}
              <div className="file-cell source-cell">
                <div className="file-item source-file">
                  <div className="file-preview" onClick={() => handleImagePreview(image)}>
                    <img src={URL.createObjectURL(image)} alt={image.name} />
                  </div>
                  <div className="file-details">
                    <span className="file-name">{image.name}</span>
                    <span className="file-size">{(image.size / (1024 * 1024)).toFixed(1)}MB</span>
                  </div>
                </div>
              </div>
              
              {/* Cột tiến trình */}
              <div className="file-cell progress-cell">
                <div className="progress-item">
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{ width: `${getProgressPercentage(processing[image.name])}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {getStageText(processing[image.name])}
                  </span>
                </div>
              </div>
              
              {/* Cột kết quả */}
              <div className="file-cell result-cell">
                {results[image.name] ? (
                  <div className="file-item result-file">
                    <div className="file-details">
                      <span className="file-name">{results[image.name].fileName}</span>
                      <span className="processing-time">
                        {results[image.name].processingTime ? 
                            `Processing time: ${(results[image.name].processingTime / 1000).toFixed(2)}s` : 
                            ''}
                      </span>
                    </div>
                    <a 
                      href={results[image.name].downloadUrl} 
                      className="download-icon-button"
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => handleSampleClick(e, results[image.name].isSample)}
                    >
                      <i className="fas fa-download"></i>
                    </a>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {isAllCompleted() ? (
          <div className="completion-message">
            <h3>All files completed!</h3>
            <button className="process-more-button" onClick={handleBackToHome}>
              Process more images
            </button>
          </div>
        ) : (
          <div className="processing-controls">
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {previewImage && (
        <ImagePreviewModal 
          image={previewImage} 
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default ProcessingPage;