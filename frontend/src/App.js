import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import PreviewPage from './pages/PreviewPage';
import ProcessingPage from './pages/ProcessingPage';
import './assets/styles/styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;