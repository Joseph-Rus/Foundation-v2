// src/renderer.ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

console.log('Renderer process starting...');

// Function to initialize React app
const initializeReactApp = () => {
  console.log('Checking electronAPI availability:', typeof window.electronAPI);

  // Create a container for React
  const container = document.getElementById('root');

  if (!container) {
    console.error('Root element not found! Check your HTML file.');
    return;
  }
  
  console.log('Root element found, initializing React app...');
  
  try {
    const root = createRoot(container);
    
    // Render the React app
    root.render(
      React.createElement(HashRouter, null, 
        React.createElement(App, null)
      )
    );
    
    console.log('React app rendered successfully');
  } catch (error) {
    console.error('Failed to render React app:', error);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, initializing app...');
  initializeReactApp();
});

// Set up global error handler
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});