// src/components/Settings.tsx
import React from 'react';
import { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings }) => {
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      theme: e.target.value as 'light' | 'dark' | 'system',
    });
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      fontSize: parseInt(e.target.value),
    });
  };
  
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      fontFamily: e.target.value,
    });
  };
  
  const handleAutoSaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      autoSave: e.target.checked,
    });
  };
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      aiService: {
        ...settings.aiService,
        apiKey: e.target.value,
      },
    });
  };
  
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      aiService: {
        ...settings.aiService,
        provider: e.target.value as 'openai' | 'gemini',
      },
    });
  };
  
  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      
      <div className="settings-section">
        <h2 className="settings-section-title">Appearance</h2>
        
        <div className="settings-item">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            value={settings.theme}
            onChange={handleThemeChange}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div className="settings-item">
          <label htmlFor="fontSize">Font Size</label>
          <input
            id="fontSize"
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={handleFontSizeChange}
          />
          <span>{settings.fontSize}px</span>
        </div>
        
        <div className="settings-item">
          <label htmlFor="fontFamily">Font Family</label>
          <select
            id="fontFamily"
            value={settings.fontFamily}
            onChange={handleFontFamilyChange}
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'SF Pro Text', sans-serif">SF Pro</option>
            <option value="'Segoe UI', sans-serif">Segoe UI</option>
          </select>
        </div>
      </div>
      
      <div className="settings-section">
        <h2 className="settings-section-title">Editor</h2>
        
        <div className="settings-item">
          <label htmlFor="autoSave">
            <input
              id="autoSave"
              type="checkbox"
              checked={settings.autoSave}
              onChange={handleAutoSaveChange}
            />
            Auto Save
          </label>
        </div>
      </div>
      
      <div className="settings-section">
        <h2 className="settings-section-title">AI Integration</h2>
        
        <div className="settings-item">
          <label htmlFor="aiProvider">AI Provider</label>
          <select
            id="aiProvider"
            value={settings.aiService.provider}
            onChange={handleProviderChange}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>
        
        <div className="settings-item">
          <label htmlFor="apiKey">API Key</label>
          <input
            id="apiKey"
            type="password"
            value={settings.aiService.apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your API key"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;