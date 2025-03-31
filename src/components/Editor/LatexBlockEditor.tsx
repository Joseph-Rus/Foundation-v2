// src/components/Editor/LatexBlockEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as katex from 'katex';
import 'katex/dist/katex.min.css';
import { NoteBlock } from '../../types';

interface LatexBlockEditorProps {
  block: NoteBlock;
  onChange: (block: NoteBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const LatexBlockEditor: React.FC<LatexBlockEditorProps> = ({ 
  block, 
  onChange, 
  onKeyDown 
}) => {
  // Default to display mode instead of edit mode
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...block,
      content: e.target.value,
    });
    setError(null);
  };

  // Toggle between edit and display mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Render LaTeX in display mode
  useEffect(() => {
    if (displayRef.current) {
      if (!block.content.trim()) {
        displayRef.current.innerHTML = '<div class="latex-empty">Empty LaTeX expression</div>';
        return;
      }

      try {
        // Use KaTeX to render the LaTeX
        katex.render(block.content, displayRef.current, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#e74c3c'
        });
      } catch (err) {
        console.error('LaTeX display error:', err);
        displayRef.current.innerHTML = '<div class="latex-error">Error rendering LaTeX</div>';
      }
    }
  }, [isEditing, block.content]);

  return (
    <div className="latex-block-editor">
      {isEditing ? (
        <div className="latex-editor-input">
          <div className="latex-editor-header">
            <span className="latex-label">LaTeX</span>
            <div className="latex-actions">
              <button 
                className="latex-done-button"
                onClick={toggleEditMode}
              >
                Done
              </button>
            </div>
          </div>
          
          <textarea
            className="latex-input"
            value={block.content}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder="Enter LaTeX expression... (e.g., E = mc^2)"
            rows={5}
            data-block-id={block.id}
          />
          
          {error && <div className="latex-error">{error}</div>}
        </div>
      ) : (
        <div 
          className="latex-display"
          data-block-id={block.id}
        >
          <div className="latex-display-header">
            <span>LaTeX</span>
            <button 
              className="latex-edit-button"
              onClick={toggleEditMode}
            >
              Edit
            </button>
          </div>
          
          <div 
            ref={displayRef}
            className="latex-display-content"
          />
        </div>
      )}
    </div>
  );
};

export default LatexBlockEditor;