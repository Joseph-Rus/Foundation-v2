// src/components/Editor/NoteEditor.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Note, NoteBlock, AppSettings, CommandResult } from '../../types';
import BlockEditor from './BlockEditor';
import CommandPalette from '../commandPalette';
import { handleCommand } from '../../services/commands/commandHandler';
import 'katex/dist/katex.min.css';

interface NoteEditorProps {
  note: Note | null;
  saveNote: (note: Note) => Promise<Note | null>;
  settings: AppSettings;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, saveNote, settings }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [localNote, setLocalNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [showCommandMessage, setShowCommandMessage] = useState<boolean>(false);
  const [commandMessage, setCommandMessage] = useState<string>('');
  const titleRef = useRef<HTMLInputElement>(null);

  // Initialize editor with note
  useEffect(() => {
    if (note) {
      setLocalNote(note);
    } else if (id) {
      // If note is not passed but ID is provided, navigate back to list
      navigate('/');
    }
  }, [note, id, navigate]);

  // Set up auto-save
  useEffect(() => {
    if (settings?.autoSave && localNote && isEditing) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        handleSave();
      }, settings.autoSaveInterval || 30000); // Default to 30 seconds if not specified
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [localNote, isEditing, settings?.autoSave, settings?.autoSaveInterval]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (localNote) {
      setLocalNote({
        ...localNote,
        title: e.target.value,
      });
      setIsEditing(true);
    }
  };

  // Handle block update
  const handleBlockUpdate = (updatedBlock: NoteBlock) => {
    if (localNote) {
      setLocalNote({
        ...localNote,
        blocks: localNote.blocks.map(block => 
          block.id === updatedBlock.id ? updatedBlock : block
        ),
      });
      setIsEditing(true);
    }
  };

  // Add a new block after the specified block ID
  const addBlockAfter = (blockId: string, type: 'text' | 'latex' | 'code' = 'text') => {
    if (localNote) {
      const blockIndex = localNote.blocks.findIndex(block => block.id === blockId);
      
      // Create default metadata based on block type
      let metadata = {};
      if (type === 'code') {
        metadata = { language: 'javascript' };
      }
      
      const newBlock: NoteBlock = {
        id: Date.now().toString(),
        type,
        content: '',
        metadata
      };
      
      const updatedBlocks = [...localNote.blocks];
      updatedBlocks.splice(blockIndex + 1, 0, newBlock);
      
      setLocalNote({
        ...localNote,
        blocks: updatedBlocks,
      });
      setIsEditing(true);
    }
  };

  // Delete a block
  const deleteBlock = (blockId: string) => {
    if (localNote && localNote.blocks.length > 1) {
      setLocalNote({
        ...localNote,
        blocks: localNote.blocks.filter(block => block.id !== blockId),
      });
      setIsEditing(true);
    }
  };

  // Save the note
  const handleSave = async () => {
    if (localNote) {
      const savedNote = await saveNote(localNote);
      if (savedNote) {
        setLocalNote(savedNote);
        setIsEditing(false);
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Cmd/Ctrl + / to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      setShowCommandPalette(true);
    }
    
    // Escape to close command palette
    if (e.key === 'Escape' && showCommandPalette) {
      e.preventDefault();
      setShowCommandPalette(false);
    }
  }, [handleSave, showCommandPalette]);

  // Set up keyboard shortcut listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle command execution
  const executeCommand = async (commandType: string, params: string): Promise<CommandResult> => {
    try {
      // Check if window.electronAPI and executeCommand are available
      if (window.electronAPI && window.electronAPI.executeCommand) {
        console.log(`Executing command: ${commandType} with params: ${params}`);
        
        // First try to use local command handler for better control
        const result = await handleCommand(commandType, params);
        
        // Handle command result
        if (result.success && result.content && localNote) {
          // Find the current active block or use the last one
          const activeElement = document.activeElement;
          const activeBlockId = activeElement?.getAttribute('data-block-id') || 
                                localNote.blocks[localNote.blocks.length - 1].id;
          
          // Find the block index
          const blockIndex = localNote.blocks.findIndex(block => block.id === activeBlockId);
          
          if (blockIndex !== -1) {
            // Determine block type based on command
            let blockType: 'text' | 'latex' | 'code' = 'text';
            let metadata = result.metadata || {};
            
            if (commandType === '/latex' || (result.metadata && result.metadata.type === 'latex')) {
              blockType = 'latex';
            } else if (commandType === '/code') {
              blockType = 'code';
              if (!metadata.language) {
                metadata.language = 'javascript'; // Default language
              }
            } else if (result.metadata && result.metadata.type) {
              blockType = result.metadata.type as any;
            }
            
            // Create a new block with the content
            const newBlock: NoteBlock = {
              id: Date.now().toString(),
              type: blockType,
              content: result.content,
              metadata
            };
            
            // Insert the new block after the active block
            const updatedBlocks = [...localNote.blocks];
            updatedBlocks.splice(blockIndex + 1, 0, newBlock);
            
            setLocalNote({
              ...localNote,
              blocks: updatedBlocks,
            });
            setIsEditing(true);
            
            // Show a success message
            setCommandMessage(`${commandType.substring(1)} command executed successfully`);
            setShowCommandMessage(true);
            setTimeout(() => setShowCommandMessage(false), 2000);
          }
        } else if (!result.success && result.error) {
          // Show error message
          setCommandMessage(`Error: ${result.error}`);
          setShowCommandMessage(true);
          setTimeout(() => setShowCommandMessage(false), 3000);
        }
        
        return result;
      } else {
        // Fallback to Electron IPC if available
        try {
          const result = await window.electronAPI.executeCommand(commandType, params);
          return result;
        } catch (error) {
          console.error('Error executing command via IPC:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  };

  // Handle command input change
  const handleCommandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommandInput(e.target.value);
  };

  // Handle command submission
  const handleCommandSubmit = async () => {
    // Extract command type and parameters
    const commandMatch = commandInput.match(/^(\/\w+)(?:\s+(.*))?$/);
    
    if (commandMatch) {
      const [, command, params = ''] = commandMatch;
      console.log(`Submitting command: ${command}, params: ${params}`);
      await executeCommand(command, params);
    }
    
    // Close command palette and reset input
    setShowCommandPalette(false);
    setCommandInput('');
  };

  // If no note is loaded, show a loading state
  if (!localNote) {
    return <div className="note-editor-container">Loading note...</div>;
  }

  return (
    <div 
      className="note-editor-container"
      style={{
        fontFamily: settings?.fontFamily || 'inherit',
        fontSize: settings?.fontSize ? `${settings.fontSize}px` : 'inherit',
      }}
    >
      <div className="note-editor-header">
        <input
          ref={titleRef}
          type="text"
          className="note-title-input"
          value={localNote.title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
        />
        
        <div className="note-editor-actions">
          <button 
            className="command-button"
            onClick={() => setShowCommandPalette(true)}
            title="Command Palette (Ctrl+/)"
          >
            /
          </button>
          
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={!isEditing}
          >
            Save
          </button>
        </div>
      </div>
      
      {showCommandMessage && (
        <div className="command-message">
          {commandMessage}
        </div>
      )}
      
      <div className="note-editor-blocks">
        {localNote.blocks.map((block, index) => (
          <BlockEditor
            key={block.id}
            block={block}
            onChange={handleBlockUpdate}
            onAddBlockAfter={addBlockAfter}
            onDeleteBlock={deleteBlock}
            isLastBlock={index === localNote.blocks.length - 1}
          />
        ))}
      </div>
      
      {showCommandPalette && (
        <CommandPalette
          input={commandInput}
          onInputChange={handleCommandInputChange}
          onSubmit={handleCommandSubmit}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;