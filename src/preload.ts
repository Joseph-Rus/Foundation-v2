// src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

console.log('🔌 Preload script executing...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Note operations
    getNotes: () => {
      console.log('Renderer called: getNotes()');
      return ipcRenderer.invoke('get-notes');
    },
    createNote: () => {
      console.log('Renderer called: createNote()');
      return ipcRenderer.invoke('create-note');
    },
    getNote: (id: string) => {
      console.log(`Renderer called: getNote(${id})`);
      return ipcRenderer.invoke('get-note', id);
    },
    saveNote: (note: any) => {
      console.log(`Renderer called: saveNote(${note?.id || 'unknown'})`);
      return ipcRenderer.invoke('save-note', note);
    },
    deleteNote: (id: string) => {
      console.log(`Renderer called: deleteNote(${id})`);
      return ipcRenderer.invoke('delete-note', id);
    },
    exportNote: (id: string) => {
      console.log(`Renderer called: exportNote(${id})`);
      return ipcRenderer.invoke('export-note', id);
    },
    
    // Settings operations
    saveSettings: (settings: any) => {
      console.log('Renderer called: saveSettings()');
      return ipcRenderer.invoke('save-settings', settings);
    },
    getSettings: () => {
      console.log('Renderer called: getSettings()');
      return ipcRenderer.invoke('get-settings').catch((error: Error): null => {
        console.error('Error in getSettings:', error);
        return null;
      });
    },
    
    // AI operations
    generateCompletion: (prompt: string, model?: string) => {
      console.log(`Renderer called: generateCompletion("${prompt.substring(0, 20)}...")`);
      return ipcRenderer.invoke('generate-completion', prompt, model);
    },
    summarizeNote: (noteId: string) => {
      console.log(`Renderer called: summarizeNote(${noteId})`);
      return ipcRenderer.invoke('summarize-note', noteId);
    },
    searchNotes: (query: string) => {
      console.log(`Renderer called: searchNotes("${query}")`);
      return ipcRenderer.invoke('search-notes', query);
    },
    
    // Utility operations
    renderLatex: (latex: string) => {
      console.log(`Renderer called: renderLatex("${latex.substring(0, 20)}...")`);
      return ipcRenderer.invoke('render-latex', latex);
    },
    executeCommand: (command: string, params: string) => {
      console.log(`Renderer called: executeCommand("${command}", "${params}")`);
      return ipcRenderer.invoke('execute-command', command, params);
    },
  }
);

// Add test functions for direct checking
contextBridge.exposeInMainWorld(
  'electronTest', {
    testConnection: () => {
      console.log('Testing IPC connection...');
      try {
        return ipcRenderer.invoke('test-ping');
      } catch (error) {
        console.error('Test connection failed:', error);
        return `Error: ${error}`;
      }
    },
    checkHandlers: () => {
      console.log('Checking available handlers...');
      const handlers = [
        'get-notes',
        'create-note',
        'get-note',
        'save-note',
        'delete-note',
        'export-note',
        'save-settings',
        'get-settings',
        'generate-completion',
        'summarize-note',
        'search-notes',
        'render-latex',
        'execute-command'
      ];
      
      return Promise.all(handlers.map(handler => 
        ipcRenderer.invoke(handler)
          .then(() => ({ handler, status: 'available' }))
          .catch(error => ({ handler, status: 'error', message: error.message }))
      ));
    }
  }
);

console.log('🔌 Preload script completed. Electron API exposed.');