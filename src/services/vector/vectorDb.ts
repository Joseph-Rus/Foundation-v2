// src/services/vector/vectorDb.ts
import * as fs from 'fs';
import * as path from 'path';
import { OpenAIService } from '../ai/openai';
import { Note, NoteVector } from '../../types';

// A simple vector database implementation for RAG
export class VectorDatabase {
  private dbPath: string;
  private openAIService: OpenAIService | null = null;
  private vectors: NoteVector[] = [];

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    
    // Ensure the directory exists
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    
    // Load existing vectors
    this.loadVectors();
  }

  // Set the OpenAI service for generating embeddings
  setOpenAIService(service: OpenAIService) {
    this.openAIService = service;
  }

  // Load vectors from disk
  private loadVectors() {
    try {
      const vectorsPath = path.join(this.dbPath, 'vectors.json');
      
      if (fs.existsSync(vectorsPath)) {
        const data = fs.readFileSync(vectorsPath, 'utf-8');
        this.vectors = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading vectors:', error);
      this.vectors = [];
    }
  }

  // Save vectors to disk
  private saveVectors() {
    try {
      const vectorsPath = path.join(this.dbPath, 'vectors.json');
      fs.writeFileSync(vectorsPath, JSON.stringify(this.vectors, null, 2));
    } catch (error) {
      console.error('Error saving vectors:', error);
    }
  }

  // Index a note's content
  async indexNote(note: Note): Promise<boolean> {
    if (!this.openAIService) {
      console.error('OpenAI service not initialized for vector embeddings');
      return false;
    }

    try {
      // Remove existing vectors for this note
      this.vectors = this.vectors.filter(v => v.noteId !== note.id);
      
      // Process each text block in the note
      for (const block of note.blocks) {
        if (block.type === 'text' && block.content) {
          // Generate embedding for the text
          const vector = await this.openAIService.generateEmbedding(block.content);
          
          // Store the vector
          this.vectors.push({
            noteId: note.id,
            blockId: block.id,
            vector,
            text: block.content,
          });
        }
      }
      
      // Save vectors to disk
      this.saveVectors();
      return true;
    } catch (error) {
      console.error('Error indexing note:', error);
      return false;
    }
  }

  // Delete a note's vectors
  deleteNoteVectors(noteId: string): boolean {
    try {
      // Remove vectors for this note
      const initialLength = this.vectors.length;
      this.vectors = this.vectors.filter(v => v.noteId !== noteId);
      
      // If vectors were removed, save to disk
      if (initialLength !== this.vectors.length) {
        this.saveVectors();
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting note vectors:', error);
      return false;
    }
  }

  // Search for similar content
  async search(query: string, limit: number = 5): Promise<Array<{ noteId: string; blockId: string; text: string; score: number; }>> {
    if (!this.openAIService || this.vectors.length === 0) {
      return [];
    }

    try {
      // Generate embedding for the query
      const queryVector = await this.openAIService.generateEmbedding(query);
      
      // Calculate cosine similarity with all vectors
      const results = this.vectors.map(vector => {
        return {
          noteId: vector.noteId,
          blockId: vector.blockId,
          text: vector.text,
          score: this.cosineSimilarity(queryVector, vector.vector),
        };
      });
      
      // Sort by similarity score (descending)
      results.sort((a, b) => b.score - a.score);
      
      // Return top results
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching vectors:', error);
      return [];
    }
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }
}