// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import NotesList from './components/NotesList';
import Timeline from './components/Timeline/Timeline';
import Settings from './components/Settings';
import NoteEditor from './components/Editor/NoteEditor';
import { AppSettings, Note, NoteMetadata } from './types';

// Default app settings
const defaultSettings: AppSettings = {
  theme: 'system',
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  aiService: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
  },
  vectorDB: {
    enabled: true,
    dbPath: '',
  },
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
};

// Window interface is defined in types.ts

const App: React.FC = () => {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('App component rendering');

  // Check for electronAPI
  useEffect(() => {
    if (!window.electronAPI) {
      setError('Electron API is not available. Check preload script configuration.');
      console.error('Electron API not found!');
      setLoading(false);
    } else {
      console.log('Electron API found, proceeding to load data');
    }
  }, []);

  // Load notes and settings on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data...');
        
        // Load settings
        console.log('Loading settings...');
        try {
          const savedSettings = await window.electronAPI.getSettings();
          console.log('Settings loaded:', savedSettings);
          if (savedSettings) {
            setSettings(savedSettings);
          }
        } catch (settingsError) {
          console.error('Error loading settings:', settingsError);
          setError(`Settings error: ${settingsError.message || 'Unknown error'}`);
        }
        
        // Load notes
        console.log('Loading notes...');
        try {
          const notes = await window.electronAPI.getNotes();
          console.log('Notes loaded:', notes);
          setNotes(notes);
        } catch (notesError) {
          console.error('Error loading notes:', notesError);
          setError(`Notes error: ${notesError.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(`Failed to load initial data: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (window.electronAPI) {
      loadInitialData();
    }
  }, []);

  // Rest of your component remains the same

  // Create a new note
  const createNote = async () => {
    try {
      const noteId = await window.electronAPI.createNote();
      
      if (noteId) {
        // Refresh notes list
        const updatedNotes = await window.electronAPI.getNotes();
        setNotes(updatedNotes);
      }
      
      return noteId;
    } catch (error) {
      console.error('Error creating note:', error);
      setError(`Failed to create note: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  // Load a note by ID
  const loadNote = async (id: string) => {
    try {
      const note = await window.electronAPI.getNote(id);
      setCurrentNote(note);
      return note;
    } catch (error) {
      console.error(`Error loading note ${id}:`, error);
      setError(`Failed to load note: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  // Save a note
  const saveNote = async (note: Note) => {
    try {
      const savedNote = await window.electronAPI.saveNote(note);
      
      // Update notes list
      const updatedNotes = await window.electronAPI.getNotes();
      setNotes(updatedNotes);
      
      return savedNote;
    } catch (error) {
      console.error('Error saving note:', error);
      setError(`Failed to save note: ${error.message || 'Unknown error'}`);
      return null;
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    try {
      const success = await window.electronAPI.deleteNote(id);
      
      if (success) {
        // Update notes list
        const updatedNotes = await window.electronAPI.getNotes();
        setNotes(updatedNotes);
      }
      
      return success;
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error);
      setError(`Failed to delete note: ${error.message || 'Unknown error'}`);
      return false;
    }
  };

  // Update settings
  const updateSettings = async (newSettings: AppSettings) => {
    try {
      await window.electronAPI.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(`Failed to update settings: ${error.message || 'Unknown error'}`);
    }
  };

  // Display error if one occurred
  if (error) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return (
    <div className="app" data-theme={settings.theme}>
      <Sidebar createNote={createNote} />
      
      <div className="content">
        <Routes>
          <Route path="/" element={
            <NotesList 
              notes={notes} 
              loadNote={loadNote}
              deleteNote={deleteNote}
              loading={loading}
            />
          } />
          
          <Route path="/note/:id" element={
            <NoteEditor 
              note={currentNote} 
              saveNote={saveNote}
              settings={settings}
            />
          } />
          
          <Route path="/timeline" element={<Timeline notes={notes} />} />
          
          <Route path="/settings" element={
            <Settings 
              settings={settings}
              updateSettings={updateSettings}
            />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;