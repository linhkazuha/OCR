import React from 'react';
import icon from '../assets/icon.png';

const Header = () => {
  return (
    <div className="header">
      <div className="logo-container">
        <img src={icon} alt="Image Translator" className="logo" />
        <div className="app-name">
          <h1>Image Translator</h1>
        </div>
      </div>
      <div className="tagline">
        <h2>Scan it - Translate it - Done it</h2>
      </div>
    </div>
  );
};

export default Header;