// src/components/Search/index.jsx
import React, { useState, useRef, useEffect } from 'react';
import './styles.css';
import { roomData } from '../../data/locations';

const Search = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDestination, setIsDestination] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    // Search for rooms by name
    const results = Object.values(roomData)
      .filter(room => 
        room.name.toLowerCase().includes(term.toLowerCase()) &&
        room.type !== 'hallway'
      )
      .slice(0, 8); // Limit to top 8 results
    
    setSearchResults(results);
  };
  
  const handleResultClick = (roomId) => {
    onSelect(roomId, isDestination);
    setSearchTerm('');
    setSearchResults([]);
    setIsFocused(false);
  };
  
  const toggleSearchType = () => {
    setIsDestination(!isDestination);
  };
  
  const getRoomIcon = (type) => {
    switch(type) {
      case 'classroom':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#5F6368" d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm5 12.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        );
      case 'laboratory':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#5F6368" d="M19.8 18.4L14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.39-.81H9.04c-.42 0-.65.48-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6z"/>
          </svg>
        );
      case 'facility':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#5F6368" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#5F6368" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        );
    }
  };
  
  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-box">
        <div className="search-icon">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="#5F6368" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
        <input
          type="text"
          placeholder={isDestination ? "Search for destination..." : "Search for starting point..."}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsFocused(true)}
          className="search-input"
        />
        {searchTerm && (
          <div className="clear-icon" onClick={() => setSearchTerm('')}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#5F6368" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </div>
        )}
        <div className="search-type-toggle" onClick={toggleSearchType}>
          {isDestination ? (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#1a73e8" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#ea4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          )}
        </div>
      </div>
      
      {isFocused && searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map(room => (
            <li 
              key={room.id} 
              onClick={() => handleResultClick(room.id)}
              className="search-result-item"
            >
              <div className="result-icon">
                {getRoomIcon(room.type)}
              </div>
              <div className="result-details">
                <span className="result-name">{room.name}</span>
                <span className="result-type">{room.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;