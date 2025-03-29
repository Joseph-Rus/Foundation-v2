// src/components/Editor/BlockEditor.tsx
import React, { useState, useRef } from 'react';
import { NoteBlock } from '../../types';
import TextBlockEditor from './TextBlockEditor';
import LatexBlockEditor from './LatexBlockEditor';
import CodeBlockEditor from './CodeBlockEditor';

interface BlockEditorProps {
  block: NoteBlock;
  onChange: (block: NoteBlock) => void;
  onAddBlockAfter: (blockId: string, type?: 'text' | 'latex' | 'code') => void;
  onDeleteBlock: (blockId: string) => void;
  isLastBlock: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  onChange,
  onAddBlockAfter,
  onDeleteBlock,
  isLastBlock,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const blockRef = useRef<HTMLDivElement>(null);

  // Handle keyboard events (Enter and Backspace)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to create a new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlockAfter(block.id);
    }
    
    // Backspace at the beginning of empty block to delete it
    if (e.key === 'Backspace' && !block.content.trim()) {
      e.preventDefault();
      onDeleteBlock(block.id);
    }
  };

  // Render the appropriate editor based on block type
  const renderBlockEditor = () => {
    // Create a common props object with only the props that child components need
    const commonProps = {
      block: block,
      onChange: onChange,
      onKeyDown: handleKeyDown
    };

    switch (block.type) {
      case 'text':
        return <TextBlockEditor {...commonProps} />;
      
      case 'latex':
        return <LatexBlockEditor {...commonProps} />;
      
      case 'code':
        return <CodeBlockEditor {...commonProps} />;
      
      default:
        return <TextBlockEditor {...commonProps} />;
    }
  };

  return (
    <div
      className={`block-editor ${isHovered ? 'hovered' : ''}`}
      data-block-id={block.id}
      ref={blockRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderBlockEditor()}
      
      {isHovered && (
        <div className="block-actions">
          <button 
            className="block-action-button"
            onClick={() => onAddBlockAfter(block.id, 'text')}
            title="Add Text Block"
          >
            T
          </button>
          
          <button 
            className="block-action-button"
            onClick={() => onAddBlockAfter(block.id, 'latex')}
            title="Add LaTeX Block"
          >
            Σ
          </button>
          
          <button 
            className="block-action-button"
            onClick={() => onAddBlockAfter(block.id, 'code')}
            title="Add Code Block"
          >
            &lt;/&gt;
          </button>
          
          <button 
            className="block-action-button"
            onClick={() => onDeleteBlock(block.id)}
            title="Delete Block"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default BlockEditor;