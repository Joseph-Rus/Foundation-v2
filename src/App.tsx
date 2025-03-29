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

declare global {
  interface Window {
    electronAPI: {
      getNotes: () => Promise<NoteMetadata[]>;
      createNote: () => Promise<string>;
      getNote: (id: string) => Promise<Note>;
      saveNote: (note: Note) => Promise<Note>;
      deleteNote: (id: string) => Promise<boolean>;
      saveSettings: (settings: AppSettings) => Promise<boolean>;
      getSettings: () => Promise<AppSettings>;
    };
  }
}

const App: React.FC = () => {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Load notes and settings on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load settings
        const savedSettings = await window.electronAPI.getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
        
        // Load notes
        const notes = await window.electronAPI.getNotes();
        setNotes(notes);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

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
    }
  };

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