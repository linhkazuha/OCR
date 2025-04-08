import React from 'react';

const DownloadSection = ({ pdfUrl, isLoading, onDownload }) => {
  return (
    <div className="section">
      <div className="section-title">
        <span className="section-icon">⬇️</span>
        Download PDF file
      </div>
      <div className="preview-container">
        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Đang xử lý...</p>
          </div>
        ) : pdfUrl ? (
          <div className="pdf-available">
            <p>PDF đã sẵn sàng để tải xuống</p>
          </div>
        ) : (
          <div className="preview-text">Preview File</div>
        )}
      </div>
      {pdfUrl && !isLoading ? (
        <button
          onClick={onDownload}
          className="download-btn"
        >
          Download PDF
        </button>
      ) : (
        <button className="download-btn" disabled>
          Download PDF
        </button>
      )}
    </div>
  );
};

export default DownloadSection;