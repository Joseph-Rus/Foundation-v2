// src/components/NotesList.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteMetadata } from '../types';

interface NotesListProps {
  notes: NoteMetadata[];
  loadNote: (id: string) => Promise<any>;
  deleteNote: (id: string) => Promise<boolean>;
  loading: boolean;
}

const NotesList: React.FC<NotesListProps> = ({ notes, loadNote, deleteNote, loading }) => {
  const navigate = useNavigate();
  
  const handleNoteClick = async (id: string) => {
    await loadNote(id);
    navigate(`/note/${id}`);
  };
  
  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      const success = await deleteNote(id);
      if (success) {
        // Note deleted successfully
      }
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return <div className="notes-list-loading">Loading notes...</div>;
  }
  
  return (
    <div className="notes-list-container">
      <div className="notes-list-header">
        <h1 className="notes-list-title">All Notes</h1>
      </div>
      
      {notes.length === 0 ? (
        <div className="notes-empty">
          <p>No notes yet. Click the "New Note" button to create one.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div
              key={note.id}
              className="note-card"
              onClick={() => handleNoteClick(note.id)}
            >
              <h3 className="note-card-title">{note.title}</h3>
              <p className="note-card-date">
                Last updated: {formatDate(note.updatedAt)}
              </p>
              
              {note.tags.length > 0 && (
                <div className="note-card-tags">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="note-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <button
                className="note-card-delete"
                onClick={(e) => handleDeleteNote(e, note.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;