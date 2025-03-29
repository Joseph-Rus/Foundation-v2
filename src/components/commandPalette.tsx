// src/components/commandPalette.tsx
import React, { useEffect, useRef } from 'react';

interface CommandPaletteProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  input,
  onInputChange,
  onSubmit,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handle Enter key press for submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Examples of commands
  const commandExamples = [
    { 
      command: '/insert', 
      description: 'Use AI to insert content based on a prompt',
      example: '/insert quadratic equation'
    },
    { 
      command: '/latex', 
      description: 'Insert a LaTeX mathematical expression',
      example: '/latex E=mc^2'
    },
    { 
      command: '/summarize', 
      description: 'Summarize selected text',
      example: '/summarize'
    }
  ];
  
  return (
    <div className="command-palette">
      <div className="command-palette-header">
        <input
          ref={inputRef}
          type="text"
          className="command-input"
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a command (e.g., /insert, /latex, /summarize)"
        />
      </div>
      
      {input === '' && (
        <div className="command-palette-suggestions">
          {commandExamples.map((example, index) => (
            <div key={index} className="command-suggestion">
              <div><strong>{example.command}</strong> - {example.description}</div>
              <div className="command-example">Example: {example.example}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="command-palette-footer">
        <button className="command-cancel-button" onClick={onClose}>
          Cancel
        </button>
        <button 
          className="command-submit-button" 
          onClick={onSubmit}
          disabled={!input.startsWith('/')}
        >
          Execute
        </button>
      </div>
    </div>
  );
};

export default CommandPalette;