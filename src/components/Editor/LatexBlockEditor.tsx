// src/components/Editor/CodeBlockEditor.tsx
import React, { useState } from 'react';
import { NoteBlock } from '../../types';

interface CodeBlockEditorProps {
  block: NoteBlock;
  onChange: (block: NoteBlock) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({ 
  block, 
  onChange, 
  onKeyDown 
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>(block.metadata?.language || 'javascript');

  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...block,
      content: e.target.value,
      metadata: {
        ...block.metadata,
        language,
      },
    });
  };

  // Handle language selection
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    onChange({
      ...block,
      metadata: {
        ...block.metadata,
        language: newLanguage,
      },
    });
  };

  // Toggle between edit and display mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="code-block-editor">
      {isEditing ? (
        <div className="code-editor-input">
          <div className="code-editor-header">
            <select
              className="language-selector"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="shell">Shell</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
            </select>
            
            <button 
              className="code-done-button"
              onClick={toggleEditMode}
            >
              Done
            </button>
          </div>
          
          <textarea
            className="code-input"
            value={block.content}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder={`Enter ${language} code...`}
            rows={5}
            data-block-id={block.id}
          />
        </div>
      ) : (
        <div 
          className="code-display"
          onClick={toggleEditMode}
          data-block-id={block.id}
        >
          <div className="code-display-header">
            <span className="code-language">{language}</span>
            <button 
              className="code-edit-button"
              onClick={toggleEditMode}
            >
              Edit
            </button>
          </div>
          
          <pre className={`language-${language}`}>
            <code>{block.content || `// Empty ${language} block`}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeBlockEditor;