// src/services/commands/commandHandler.ts
import axios from 'axios';
import { CommandResult } from '../../types';

// Templates for common LaTeX equations and content
const TEMPLATES = {
  quadratic: '2x^2 - 7x - 15 = 0',
  quadraticSolution: `\\begin{aligned}
2x^2 - 7x - 15 &= 0\\\\
a &= 2, b = -7, c = -15\\\\
x &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\\\
x &= \\frac{7 \\pm \\sqrt{49 + 120}}{4}\\\\
x &= \\frac{7 \\pm \\sqrt{169}}{4}\\\\
x &= \\frac{7 \\pm 13}{4}\\\\
x_1 &= \\frac{7 + 13}{4} = \\frac{20}{4} = 5\\\\
x_2 &= \\frac{7 - 13}{4} = \\frac{-6}{4} = -\\frac{3}{2} = -1.5
\\end{aligned}`,
  pythagoras: 'a^2 + b^2 = c^2',
  euler: 'e^{i\\pi} + 1 = 0',
  integral: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)',
  derivative: '\\frac{d}{dx}[f(x)] = f\'(x)',
  limit: '\\lim_{x \\to a} f(x) = L',
  matrix: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  einstein: 'E = mc^2',
};

// Command handler for different types of commands
export const handleCommand = async (command: string, params: string): Promise<CommandResult> => {
  // Extract the command name without the slash
  const cmdName = command.substring(1).toLowerCase();
  
  switch (cmdName) {
    case 'insert':
      return handleInsertCommand(params);
    case 'latex':
      return handleLatexCommand(params);
    case 'code':
      return handleCodeCommand(params);
    default:
      return {
        success: false,
        error: `Unknown command: ${command}`
      };
  }
};

// Handle generic /insert command which uses AI to determine content type
const handleInsertCommand = async (params: string): Promise<CommandResult> => {
  // Check for template keywords first
  const lowercaseParams = params.toLowerCase().trim();
  
  // Handle specific template requests explicitly
  if (lowercaseParams.includes('quadratic equation') || lowercaseParams === 'quadratic') {
    return {
      success: true,
      content: TEMPLATES.quadraticSolution,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('pythagoras') || lowercaseParams.includes('pythagorean')) {
    return {
      success: true,
      content: TEMPLATES.pythagoras,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('euler') || lowercaseParams.includes('identity')) {
    return {
      success: true,
      content: TEMPLATES.euler,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('einstein') || lowercaseParams.includes('relativity')) {
    return {
      success: true,
      content: TEMPLATES.einstein,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('integral')) {
    return {
      success: true,
      content: TEMPLATES.integral,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('derivative')) {
    return {
      success: true,
      content: TEMPLATES.derivative,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('limit')) {
    return {
      success: true,
      content: TEMPLATES.limit,
      metadata: { type: 'latex' }
    };
  }
  
  if (lowercaseParams.includes('matrix')) {
    return {
      success: true,
      content: TEMPLATES.matrix,
      metadata: { type: 'latex' }
    };
  }
  
  // Handle poem request
  if (lowercaseParams.includes('poem') || lowercaseParams.includes('poetry')) {
    return generatePoem(params);
  }
  
  // Default to generating text via AI service
  try {
    // Mock AI generation for now (would connect to your AI service)
    // This is where you'd call your OpenAI or Gemini API
    const generatedText = await mockAIGeneration(params);
    
    return {
      success: true,
      content: generatedText,
      metadata: { type: 'text' }
    };
  } catch (error) {
    console.error('Error handling insert command:', error);
    return {
      success: false,
      error: `Error generating content: ${error.message}`
    };
  }
};

// Handle /latex command specifically for LaTeX content
const handleLatexCommand = async (params: string): Promise<CommandResult> => {
  // If it's empty, provide a placeholder
  if (!params.trim()) {
    return {
      success: true,
      content: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      metadata: { type: 'latex' }
    };
  }
  
  // Check for template keywords
  const lowercaseParams = params.toLowerCase().trim();
  
  // Check for specific templates
  for (const [key, value] of Object.entries(TEMPLATES)) {
    if (lowercaseParams.includes(key)) {
      return {
        success: true,
        content: value,
        metadata: { type: 'latex' }
      };
    }
  }
  
  // Just use the params as-is for LaTeX
  return {
    success: true,
    content: params,
    metadata: { type: 'latex' }
  };
};

// Handle /code command
const handleCodeCommand = async (params: string): Promise<CommandResult> => {
  // Parse language from params if provided (format: "language:code")
  const colonIndex = params.indexOf(':');
  let language = 'javascript'; // Default language
  let code = params;
  
  if (colonIndex > -1) {
    language = params.substring(0, colonIndex).trim();
    code = params.substring(colonIndex + 1).trim();
  }
  
  // If code is empty, provide a placeholder
  if (!code.trim()) {
    code = getCodePlaceholder(language);
  }
  
  return {
    success: true,
    content: code,
    metadata: { language }
  };
};

// Generate a poem based on the topic
const generatePoem = async (topic: string): Promise<CommandResult> => {
  // Sample poems for various topics
  const poems = {
    nature: `The whisper of the leaves,
A dance upon the breeze,
Nature's gentle symphony,
Brings the heart to ease.

Sunlight filters through the trees,
Painting shadows on the ground,
In this moment of pure peace,
True serenity is found.`,

    love: `In the quiet moments between words,
I find the echo of your heart.
A love that needs no ornate verse,
Just two souls no longer apart.

Time may weather stone and steel,
But what we've built remains true,
A sanctuary where we can feel
The depth of love between us two.`,

    time: `Seconds tick like falling sand,
Minutes flow like gentle streams,
Hours pass by, hand in hand,
Days dissolve into our dreams.

Time, the master we can't tame,
Moves forward, never still,
Yet memories, forever remain,
No passing moment can kill.`,

    default: `Words dance across the page,
Painting pictures in the mind,
Emotions captured in a cage,
Of verses, carefully aligned.

Each stanza tells a story,
Each line a thought revealed,
In poetry, we find glory,
And truths once concealed.`
  };
  
  // Look for keywords in the topic
  const lowercaseTopic = topic.toLowerCase();
  
  if (lowercaseTopic.includes('nature') || 
      lowercaseTopic.includes('tree') || 
      lowercaseTopic.includes('forest')) {
    return {
      success: true,
      content: poems.nature,
      metadata: { type: 'text' }
    };
  }
  
  if (lowercaseTopic.includes('love') || 
      lowercaseTopic.includes('heart') || 
      lowercaseTopic.includes('romance')) {
    return {
      success: true,
      content: poems.love,
      metadata: { type: 'text' }
    };
  }
  
  if (lowercaseTopic.includes('time') || 
      lowercaseTopic.includes('clock') || 
      lowercaseTopic.includes('moment')) {
    return {
      success: true,
      content: poems.time,
      metadata: { type: 'text' }
    };
  }
  
  // Default poem
  return {
    success: true,
    content: poems.default,
    metadata: { type: 'text' }
  };
};

// Mock AI generation (replace with actual AI service call)
const mockAIGeneration = async (prompt: string): Promise<string> => {
  // This is where you'd call your OpenAI or Gemini API
  // For now, just return some placeholder text based on the prompt
  
  // Wait a bit to simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return `Generated content based on: "${prompt}"\n\nThis is placeholder text that would normally be generated by an AI service like OpenAI or Google Gemini. In your actual implementation, you would make an API call to get a real response based on the user's request.`;
};

// Get code placeholder based on language
const getCodePlaceholder = (language: string): string => {
  switch (language.toLowerCase()) {
    case 'javascript':
      return `function helloWorld() {
  console.log("Hello, world!");
  return "Welcome to Foundation!";
}`;
    case 'python':
      return `def hello_world():
    print("Hello, world!")
    return "Welcome to Foundation!"`;
    case 'java':
      return `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`;
    case 'c':
    case 'cpp':
      return `#include <iostream>

int main() {
    std::cout << "Hello, world!" << std::endl;
    return 0;
}`;
    default:
      return `// ${language} code goes here
// Hello, world!`;
  }
};