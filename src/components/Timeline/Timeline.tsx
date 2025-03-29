// src/components/Timeline/Timeline.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteMetadata } from '../../types';

interface TimelineProps {
  notes: NoteMetadata[];
}

interface MonthData {
  month: string;
  year: number;
  notesByDay: Map<number, NoteMetadata[]>;
}

const Timeline: React.FC<TimelineProps> = ({ notes }) => {
  const navigate = useNavigate();
  
  // Group notes by month and day
  const timelineData = useMemo(() => {
    const data: MonthData[] = [];
    const monthsMap = new Map<string, MonthData>();
    
    // Sort notes by date (newest first)
    const sortedNotes = [...notes].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    // Group notes by month and day
    sortedNotes.forEach(note => {
      const date = new Date(note.updatedAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      const monthKey = `${year}-${month}`;
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          month: date.toLocaleString('en-US', { month: 'long' }),
          year,
          notesByDay: new Map(),
        });
      }
      
      const monthData = monthsMap.get(monthKey)!;
      
      if (!monthData.notesByDay.has(day)) {
        monthData.notesByDay.set(day, []);
      }
      
      monthData.notesByDay.get(day)!.push(note);
    });
    
    // Convert map to array
    monthsMap.forEach(monthData => {
      data.push(monthData);
    });
    
    // Sort months by date (newest first)
    data.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      
      return b.month.localeCompare(a.month);
    });
    
    return data;
  }, [notes]);
  
  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };
  
  // Generate days for a month
  const generateDays = (year: number, monthName: string) => {
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    
    // Generate empty cells for days before the first day of the month
    const emptyDays = Array(firstDayOfMonth).fill(null);
    
    // Generate days
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return [...emptyDays, ...days];
  };
  
  // Get activity level for a day
  const getActivityLevel = (monthData: MonthData, day: number | null) => {
    if (day === null) {
      return 'empty';
    }
    
    const notesForDay = monthData.notesByDay.get(day);
    
    if (!notesForDay || notesForDay.length === 0) {
      return 'none';
    }
    
    if (notesForDay.length === 1) {
      return 'low';
    }
    
    if (notesForDay.length <= 3) {
      return 'medium';
    }
    
    return 'high';
  };
  
  if (notes.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-header">
          <h1 className="timeline-title">Timeline</h1>
        </div>
        <div className="timeline-empty">
          <p>No notes yet. Create some notes to see your timeline.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h1 className="timeline-title">Timeline</h1>
      </div>
      
      <div className="timeline">
        {timelineData.map((monthData, index) => (
          <div key={index} className="timeline-month">
            <h2 className="timeline-month-title">
              {monthData.month} {monthData.year}
            </h2>
            
            <div className="timeline-days">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={index} className="timeline-weekday">
                  {day}
                </div>
              ))}
              
              {/* Days */}
              {generateDays(monthData.year, monthData.month).map((day, index) => (
                <div
                  key={index}
                  className={`timeline-day activity-${getActivityLevel(monthData, day)}`}
                  onClick={() => {
                    if (day !== null && monthData.notesByDay.has(day)) {
                      const notes = monthData.notesByDay.get(day)!;
                      if (notes.length === 1) {
                        handleNoteClick(notes[0].id);
                      } else {
                        // Show a popup with all notes for this day
                        // For simplicity, we're just opening the first note
                        handleNoteClick(notes[0].id);
                      }
                    }
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;