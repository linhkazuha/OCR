import React from 'react';
import logo from '../assets/icon.png';

const Header = () => {
  return (
    <header className="app-header">
      <div className="app-logo">
        <img src={logo} alt="Image Translator Logo" />
        <h1>Image Translator</h1>
      </div>
      <div className="app-title">
        Scan it - Translate it - Done it
      </div>
    </header>
  );
};

export default Header;