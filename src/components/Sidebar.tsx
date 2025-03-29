// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface SidebarProps {
  createNote: () => Promise<string | null>;
}

const Sidebar: React.FC<SidebarProps> = ({ createNote }) => {
  const navigate = useNavigate();
  
  const handleCreateNote = async () => {
    try {
      // Create a new note and get its ID
      const noteId = await createNote();
      
      // If we got a valid note ID back, navigate to it
      if (noteId) {
        navigate(`/note/${noteId}`);
      }
      
      // Debug output
      console.log('Created note with ID:', noteId);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Foundation</h1>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
          end
        >
          <span className="sidebar-nav-icon">📝</span>
          <span>All Notes</span>
        </NavLink>
        
        <NavLink 
          to="/timeline" 
          className={({ isActive }) => 
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="sidebar-nav-icon">📅</span>
          <span>Timeline</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `sidebar-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="sidebar-nav-icon">⚙️</span>
          <span>Settings</span>
        </NavLink>
      </nav>
      
      <button 
        className="new-note-button" 
        onClick={handleCreateNote}
      >
        + New Note
      </button>
    </div>
  );
};

export default Sidebar;