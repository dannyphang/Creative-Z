import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import LinkDashboard from './components/LinkDashboard';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';
import Settings from './components/Settings';

import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/link-admin" element={
            <AuthGuard>
              <LinkDashboard />
            </AuthGuard>
          } />
          <Route path="/link-settings" element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
    </>
  );
}
