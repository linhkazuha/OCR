import React, { useEffect, useState } from 'react';
import './assets/styles/App.css';
import Header from './components/header';
import UploadSection from './components/upload';
import DownloadSection from './components/download';
import TranslateButton from './components/translate';
import API from './services/api';
import io from 'socket.io-client';

const socket = io("http://localhost:3001");

function App() {
  const [selectedFile, setSelectedFile] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log(file);
    setPdfUrl(null);
    setFileName(null);
    setError(null);
  };

  const handleTranslate = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ít nhất một file hình ảnh');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await API.uploadImage(selectedFile);
      
      if (result && result.pdfUrl) {
        // Lấy tên file từ URL
        const pdfFileName = result.pdfUrl.split('/').pop();
        setFileName(pdfFileName);
        
        // Lưu đường dẫn đầy đủ
        setPdfUrl(`${API.API_URL}${result.pdfUrl}`);
      } else {
        throw new Error('Không nhận được URL của PDF từ server');
      }
    } catch (err) {
      setError(`Lỗi: ${err.message || 'Không thể xử lý hình ảnh'}`);
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileName) {
      // Tạo thẻ a và mô phỏng click để tải xuống
      const downloadUrl = API.getDownloadUrl(fileName);
      window.open(downloadUrl, '_blank');
    }
  };

  useEffect(() => {
    socket.on("url-ready", (url) => {
      console.log("PDF is ready to download", url);

    });

    return () => {
      socket.off("url-ready");
    };
  }, []);

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <div className="main-section">
          <UploadSection onFileSelected={handleFileSelect} />
          <DownloadSection 
            pdfUrl={pdfUrl} 
            isLoading={isLoading} 
            onDownload={handleDownload}
          />
        </div>
        
        <TranslateButton 
          onClick={handleTranslate} 
          disabled={!selectedFile || isLoading} 
          isLoading={isLoading} 
        />
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default App;