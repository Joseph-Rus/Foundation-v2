// src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

console.log('🔌 Preload script executing...');

// Create a safer error handling wrapper for IPC calls
const safeIpcCall = async (channel: string, ...args: any[]) => {
  try {
    console.log(`Renderer called: ${channel}`);
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    console.error(`Error in ${channel}:`, error);
    throw error; // Re-throw to let the renderer handle it
  }
};

try {
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld(
    'electronAPI', {
      // Debug operations
      debugIpc: () => safeIpcCall('debug-ipc'),
      testConnection: () => safeIpcCall('test-ping'),
      
      // Note operations
      getNotes: () => safeIpcCall('get-notes'),
      createNote: () => safeIpcCall('create-note'),
      getNote: (id: string) => safeIpcCall('get-note', id),
      saveNote: (note: any) => safeIpcCall('save-note', note),
      deleteNote: (id: string) => safeIpcCall('delete-note', id),
      exportNote: (id: string) => safeIpcCall('export-note', id),
      
      // Settings operations
      saveSettings: (settings: any) => safeIpcCall('save-settings', settings),
      getSettings: () => safeIpcCall('get-settings'),
      
      // AI operations (placeholders - will be implemented later)
      generateCompletion: (prompt: string, model?: string) => 
        safeIpcCall('generate-completion', prompt, model),
      summarizeNote: (noteId: string) => 
        safeIpcCall('summarize-note', noteId),
      searchNotes: (query: string) => 
        safeIpcCall('search-notes', query),
      
      // Utility operations
      renderLatex: (latex: string) => 
        safeIpcCall('render-latex', latex),
      executeCommand: (command: string, params: string) => 
        safeIpcCall('execute-command', command, params),
    }
  );
  
  console.log('✅ Successfully exposed electronAPI to renderer process');
} catch (error) {
  console.error('❌ Failed to expose electronAPI:', error);
}

console.log('🔌 Preload script completed.');