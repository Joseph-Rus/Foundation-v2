// src/renderer.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

console.log('🚀 Renderer process starting...');
console.log('📌 Checking electronAPI availability:', typeof window.electronAPI);

// Log available electronAPI methods for debugging
if (window.electronAPI) {
  console.log('📋 Available electronAPI methods:', Object.keys(window.electronAPI));
} else {
  console.error('❌ ERROR: electronAPI is not available! Check preload script setup.');
}

// Create a container for React
const container = document.getElementById('root');

if (!container) {
  console.error('❌ ERROR: Root element not found! Check your HTML file.');
} else {
  console.log('✅ Root element found, initializing React app...');
  
  try {
    const root = createRoot(container);
    
    // Wrap with error boundary for better debugging
    window.addEventListener('error', (event) => {
      console.error('🔥 Uncaught error:', event.error);
    });
    
    // Render the React app
    root.render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    
    console.log('✅ React app rendered successfully');
  } catch (error) {
    console.error('❌ ERROR: Failed to render React app:', error);
  }
}