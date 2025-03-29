// src/renderer.ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Initialize the React app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  React.createElement(
    React.StrictMode, 
    null,
    React.createElement(HashRouter, null, React.createElement(App, null))
  )
);