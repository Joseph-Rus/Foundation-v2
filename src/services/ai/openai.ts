// src/services/ai/openai.ts
import { AICompletion } from '../../types';
import axios from 'axios';

export class OpenAIService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<AICompletion> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for a note-taking application.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        text: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model: 'text-embedding-ada-002',
          input: text,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI Embedding API error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }
}