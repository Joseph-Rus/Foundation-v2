// src/services/ai/index.ts
import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { AIServiceConfig, Note, AICompletion, AISearchResult } from '../../types';
import { OpenAIService } from './openai';
import { GeminiService } from './gemini';
import { VectorDatabase } from '../vector/vectorDb';

// Default config paths
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const notesDir = path.join(userDataPath, 'notes');
const vectorDbPath = path.join(userDataPath, 'vector_db');

// Load or create config
let config: {
  aiService: AIServiceConfig;
  vectorDB: {
    enabled: boolean;
    dbPath: string;
  };
};

try {
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } else {
    config = {
      aiService: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo',
      },
      vectorDB: {
        enabled: true,
        dbPath: vectorDbPath,
      },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
} catch (error) {
  console.error('Error loading config:', error);
  config = {
    aiService: {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo',
    },
    vectorDB: {
      enabled: true,
      dbPath: vectorDbPath,
    },
  };
}

// Initialize services
let openAIService: OpenAIService | null = null;
let geminiService: GeminiService | null = null;
let vectorDB: VectorDatabase | null = null;

// Initialize services based on config
function initializeServices() {
  try {
    // Initialize OpenAI if API key is provided
    if (config.aiService.provider === 'openai' && config.aiService.apiKey) {
      openAIService = new OpenAIService(config.aiService.apiKey, config.aiService.model);
    }

    // Initialize Gemini if API key is provided
    if (config.aiService.provider === 'gemini' && config.aiService.apiKey) {
      geminiService = new GeminiService(config.aiService.apiKey, config.aiService.model);
    }

    // Initialize Vector DB if enabled
    if (config.vectorDB.enabled) {
      vectorDB = new VectorDatabase(config.vectorDB.dbPath);
      // Index existing notes
      indexExistingNotes();
    }
  } catch (error) {
    console.error('Error initializing AI services:', error);
  }
}

// Index existing notes in the vector database
async function indexExistingNotes() {
  if (!vectorDB) return;

  const files = fs.readdirSync(notesDir).filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(notesDir, file), 'utf-8');
      const note: Note = JSON.parse(content);
      
      // Index the note
      await vectorDB.indexNote(note);
    } catch (error) {
      console.error(`Error indexing note ${file}:`, error);
    }
  }
}

// Register IPC handlers
export function registerAIHandlers() {
  // Initialize services first
  initializeServices();

  // Generate completion using the selected AI service
  ipcMain.handle('generate-completion', async (_, prompt: string, model?: string) => {
    try {
      if (model === 'gemini' && geminiService) {
        return await geminiService.generateCompletion(prompt);
      } else if (openAIService) {
        return await openAIService.generateCompletion(prompt);
      } else {
        throw new Error('No AI service is configured');
      }
    } catch (error) {
      console.error('Error generating completion:', error);
      return {
        text: `Error: ${error.message}`,
        error: true,
      };
    }
  });

  // Summarize a note
  ipcMain.handle('summarize-note', async (_, noteId: string) => {
    try {
      const notePath = path.join(notesDir, `${noteId}.json`);
      const note: Note = JSON.parse(fs.readFileSync(notePath, 'utf-8'));
      
      // Extract text content from all blocks
      const textContent = note.blocks
        .filter(block => block.type === 'text')
        .map(block => block.content)
        .join('\n\n');
      
      const prompt = `Summarize the following note:\n\n${textContent}`;
      
      let summary: AICompletion;
      if (config.aiService.provider === 'gemini' && geminiService) {
        summary = await geminiService.generateCompletion(prompt);
      } else if (openAIService) {
        summary = await openAIService.generateCompletion(prompt);
      } else {
        throw new Error('No AI service is configured');
      }
      
      return summary.text;
    } catch (error) {
      console.error('Error summarizing note:', error);
      return `Error generating summary: ${error.message}`;
    }
  });

  // Search notes using the vector database
  ipcMain.handle('search-notes', async (_, query: string) => {
    try {
      if (!vectorDB) {
        throw new Error('Vector database is not enabled');
      }
      
      // Search for similar content
      const results = await vectorDB.search(query);
      
      // Format results
      const formattedResults: AISearchResult[] = [];
      
      for (const result of results) {
        try {
          const notePath = path.join(notesDir, `${result.noteId}.json`);
          const note: Note = JSON.parse(fs.readFileSync(notePath, 'utf-8'));
          
          formattedResults.push({
            noteId: result.noteId,
            title: note.title,
            snippet: result.text.substring(0, 150) + '...',
            score: result.score,
          });
        } catch (error) {
          console.error(`Error processing search result for note ${result.noteId}:`, error);
        }
      }
      
      return formattedResults;
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  });

  // Update AI service configuration
  ipcMain.handle('update-ai-config', async (_, newConfig: AIServiceConfig) => {
    try {
      config.aiService = newConfig;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      // Reinitialize services
      initializeServices();
      
      return true;
    } catch (error) {
      console.error('Error updating AI config:', error);
      return false;
    }
  });

  // Toggle vector database
  ipcMain.handle('toggle-vector-db', async (_, enabled: boolean) => {
    try {
      config.vectorDB.enabled = enabled;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      // Reinitialize services
      initializeServices();
      
      return true;
    } catch (error) {
      console.error('Error toggling vector DB:', error);
      return false;
    }
  });

  // Commands system
  ipcMain.handle('execute-command', async (_, command: string, params: string) => {
    try {
      // Extract command name
      const cmdName = command.toLowerCase();
      
      // Handle different commands
      switch (cmdName) {
        case '/insert':
          return handleInsertCommand(params);
        case '/summarize':
          return handleSummarizeCommand(params);
        case '/latex':
          return handleLatexCommand(params);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });
}

// Command handlers
async function handleInsertCommand(params: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const service = config.aiService.provider === 'gemini' && geminiService 
      ? geminiService 
      : openAIService;
    
    if (!service) {
      throw new Error('No AI service is configured');
    }
    
    const prompt = `Generate content for the following topic: ${params}. 
    The content should be informative, well-structured, and suitable for inclusion in a note.`;
    
    const completion = await service.generateCompletion(prompt);
    
    return {
      success: true,
      content: completion.text,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error handling /insert command: ${error.message}`,
    };
  }
}

async function handleSummarizeCommand(params: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const service = config.aiService.provider === 'gemini' && geminiService 
      ? geminiService 
      : openAIService;
    
    if (!service) {
      throw new Error('No AI service is configured');
    }
    
    const prompt = `Summarize the following text concisely: ${params}`;
    
    const completion = await service.generateCompletion(prompt);
    
    return {
      success: true,
      content: completion.text,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error handling /summarize command: ${error.message}`,
    };
  }
}

async function handleLatexCommand(params: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    // For LaTeX, we might not need AI, but could use a renderer like MathJax or KaTeX
    // Here we'll return the LaTeX as-is, and the frontend will render it
    return {
      success: true,
      content: params,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error handling /latex command: ${error.message}`,
    };
  }
}