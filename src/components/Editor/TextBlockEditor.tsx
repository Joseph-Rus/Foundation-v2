// src/components/Editor/TextBlockEditor.tsx
import React, { useRef, useEffect } from 'react';
import { NoteBlock } from '../../types';

interface TextBlockEditorProps {
  block: NoteBlock;
  onChange: (block: NoteBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({ block, onChange, onKeyDown }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...block,
      content: e.target.value,
    });
  };

  return (
    <textarea
      ref={textareaRef}
      className="text-block-editor"
      value={block.content}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder="Type something..."
      rows={1}
      data-block-id={block.id}
    />
  );
};

export default TextBlockEditor;