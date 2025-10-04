import React from 'react';

const FloatingToggleButton = ({ onClick, isExpanded }) => {
  return (
    <div 
      className="floating-action-btn"
      onClick={onClick}
    >
      {isExpanded ? (
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="white" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="white" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
        </svg>
      )}
    </div>
  );
};

export default FloatingToggleButton;