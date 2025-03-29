// src/types.ts
// Note structure
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  blocks: NoteBlock[];
}

export interface NoteMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Note block types for different content
export type NoteBlockType = 'text' | 'latex' | 'code' | 'image' | 'table';

export interface NoteBlock {
  id: string;
  type: NoteBlockType;
  content: string;
  metadata?: Record<string, any>;
}

// AI service types
export interface AIServiceConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
  model: string;
}

export interface AICompletion {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AISearchResult {
  noteId: string;
  title: string;
  snippet: string;
  score: number;
}

// Command types
export interface Command {
  name: string;
  description: string;
  icon?: string;
  handler: (params: string) => Promise<CommandResult>;
}

export interface CommandResult {
  success: boolean;
  content?: string;
  error?: string;
}

// Vector DB types
export interface VectorDBConfig {
  enabled: boolean;
  dbPath: string;
}

export interface NoteVector {
  noteId: string;
  blockId: string;
  vector: number[];
  text: string;
}

// Global app settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  aiService: AIServiceConfig;
  vectorDB: VectorDBConfig;
  autoSave: boolean;
  autoSaveInterval: number;
}

// Timeline types
export interface TimelineEntry {
  id: string;
  noteId: string;
  title: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
}

// For Electron window
declare global {
  interface Window {
    electronAPI: {
      getNotes: () => Promise<NoteMetadata[]>;
      getNote: (id: string) => Promise<Note | null>;
      saveNote: (note: Note) => Promise<Note>;
      deleteNote: (id: string) => Promise<boolean>;
      createNote: () => Promise<string>;
      saveSettings: (settings: AppSettings) => Promise<boolean>;
      getSettings: () => Promise<AppSettings>;
      exportNote: (id: string) => Promise<boolean>;
      generateCompletion: (prompt: string, model?: string) => Promise<AICompletion>;
      summarizeNote: (noteId: string) => Promise<string>;
      searchNotes: (query: string) => Promise<AISearchResult[]>;
      renderLatex: (latex: string) => Promise<string>;
      executeCommand: (command: string, params: string) => Promise<CommandResult>;
    };
  }
}