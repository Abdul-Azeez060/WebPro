import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { EditorPage } from './pages/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;