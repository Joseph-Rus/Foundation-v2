// src/services/ai/gemini.ts
import { AICompletion } from '../../types';
import axios from 'axios';

export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://generativelanguage.googleapis.com';
  private apiVersion = 'v1';

  constructor(apiKey: string, model: string = 'gemini-1.0-pro') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<AICompletion> {
    try {
      const url = `${this.baseUrl}/${this.apiVersion}/models/${this.model}:generateContent?key=${this.apiKey}`;

      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.95,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract the text from the response
      const content = response.data.candidates[0].content;
      const text = content.parts[0].text;

      return {
        text,
        // Gemini API doesn't provide token usage information
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  // Note: Gemini may not provide dedicated embedding API
  // For compatibility, we'll proxy to a text generation endpoint
  async generateEmbedding(text: string): Promise<number[]> {
    // This is a placeholder. For a real implementation,
    // you would need to use a different model or service for embeddings
    throw new Error('Embedding generation not yet implemented for Gemini');
  }
}