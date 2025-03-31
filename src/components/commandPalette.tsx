// src/components/commandPalette.tsx
import React, { useEffect, useRef, useState } from 'react';

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
  const [selectedCommand, setSelectedCommand] = useState<number>(0);
  const paletteRef = useRef<HTMLDivElement>(null);
  
  // Command examples with detailed information
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
      command: '/code', 
      description: 'Insert a code block with syntax highlighting',
      example: '/code python:def hello_world():'
    },
    { 
      command: '/summarize', 
      description: 'Summarize selected text',
      example: '/summarize This is a long text that needs summarizing'
    }
  ];
  
  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add click outside handler to close palette
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle keyboard navigation and command selection
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input === '' && commandExamples[selectedCommand]) {
        // If input is empty and a command is selected, fill in the command
        const selectedCmd = commandExamples[selectedCommand].command;
        onInputChange({ target: { value: selectedCmd + ' ' } } as React.ChangeEvent<HTMLInputElement>);
      } else {
        // Otherwise, submit the command
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommand((prev) => 
        (prev + 1) % filteredCommands.length
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommand((prev) => 
        (prev - 1 + filteredCommands.length) % filteredCommands.length
      );
    }
  };

  const handleCommandClick = (cmd: string) => {
    onInputChange({ target: { value: cmd + ' ' } } as React.ChangeEvent<HTMLInputElement>);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Filter commands based on input
  const filteredCommands = input 
    ? commandExamples.filter(cmd => 
        cmd.command.toLowerCase().includes(input.toLowerCase()) ||
        cmd.description.toLowerCase().includes(input.toLowerCase())
      )
    : commandExamples;
  
  return (
    <div className="command-palette-overlay">
      <div 
        className="command-palette"
        ref={paletteRef}
      >
        <div className="command-palette-header">
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g., /insert, /latex, /code)"
          />
        </div>
        
        <div className="command-palette-suggestions">
          {filteredCommands.map((example, index) => (
            <div 
              key={index} 
              className={`command-suggestion ${selectedCommand === index ? 'selected' : ''}`}
              onClick={() => handleCommandClick(example.command)}
            >
              <div><strong>{example.command}</strong> - {example.description}</div>
              <div className="command-example">Example: {example.example}</div>
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="command-no-results">
              No matching commands found.
            </div>
          )}
        </div>
        
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
    </div>
  );
};

export default CommandPalette;