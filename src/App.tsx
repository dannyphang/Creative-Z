import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import LinkDashboard from './components/LinkDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/link-admin" element={<LinkDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
