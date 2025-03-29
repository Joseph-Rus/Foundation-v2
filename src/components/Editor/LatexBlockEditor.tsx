// src/components/Editor/LatexBlockEditor.tsx
import React, { useState, useEffect } from 'react';
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
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedLatex, setRenderedLatex] = useState<string>('');

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...block,
      content: e.target.value,
    });
    // Clear errors when content changes
    setError(null);
  };

  // Toggle between edit and display mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Attempt to render LaTeX before switching to display mode
      renderLatex();
    }
    setIsEditing(!isEditing);
  };

  // Render LaTeX with KaTeX
  const renderLatex = () => {
    if (!block.content.trim()) {
      setRenderedLatex('');
      return;
    }

    try {
      const html = katex.renderToString(block.content, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#e74c3c',
        strict: 'ignore'
      });
      setRenderedLatex(html);
      setError(null);
    } catch (err) {
      console.error('LaTeX rendering error:', err);
      setError(err.message || 'Error rendering LaTeX');
      setRenderedLatex('');
    }
  };

  // Re-render LaTeX when content changes
  useEffect(() => {
    if (!isEditing) {
      renderLatex();
    }
  }, [block.content, isEditing]);

  return (
    <div className="latex-block-editor">
      {isEditing ? (
        <div className="latex-editor-input">
          <div className="latex-editor-header">
            <span className="latex-label">LaTeX</span>
            <div className="latex-actions">
              <button 
                className="latex-preview-button"
                onClick={renderLatex}
                title="Preview"
              >
                Preview
              </button>
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
            rows={3}
            data-block-id={block.id}
          />
          
          {error && <div className="latex-error">{error}</div>}
          
          {renderedLatex && (
            <div className="latex-preview">
              <div className="latex-preview-header">Preview:</div>
              <div 
                className="latex-preview-content"
                dangerouslySetInnerHTML={{ __html: renderedLatex }}
              />
            </div>
          )}
        </div>
      ) : (
        <div 
          className="latex-display"
          onClick={toggleEditMode}
          data-block-id={block.id}
        >
          {renderedLatex ? (
            <div 
              className="latex-display-content" 
              dangerouslySetInnerHTML={{ __html: renderedLatex }}
            />
          ) : (
            <div className="latex-empty">Empty LaTeX expression</div>
          )}
          
          <button 
            className="latex-edit-button"
            onClick={toggleEditMode}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default LatexBlockEditor;