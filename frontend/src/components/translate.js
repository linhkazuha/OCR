import React from 'react';

const TranslateButton = ({ onClick, disabled, isLoading }) => {
  return (
    <div className="translate-btn-container">
      <button 
        className="translate-btn" 
        onClick={onClick} 
        disabled={disabled || isLoading}
      >
        {isLoading ? 'Đang xử lý...' : 'Translate'}
      </button>
    </div>
  );
};

export default TranslateButton;