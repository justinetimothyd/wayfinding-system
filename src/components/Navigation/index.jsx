// src/components/Navigation/index.jsx

import React, { useState, useEffect } from 'react';
import './styles.css';
import { roomData, roomCategories, floors } from '../../data/locations';
import { findPath } from '../../utils/pathfinding';
import Map from '../Map';
import Search from '../Search';

const Navigation = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [path, setPath] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(1); // Default to 1st floor
  
  // Check URL for location parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const locationParam = queryParams.get('location');
    const floorParam = queryParams.get('floor');
    
    if (locationParam && roomData[locationParam]) {
      setCurrentLocation(locationParam);
      // If location is specified, set the floor to match that location
      setCurrentFloor(roomData[locationParam].floor);
    }
    
    if (floorParam && Object.keys(floors).includes(floorParam)) {
      setCurrentFloor(parseInt(floorParam));
    }
  }, []);
  
  // Reset path when locations change
  useEffect(() => {
    setPath(null);
  }, [currentLocation, destination]);
  
  // Handle floor change
  const handleFloorChange = (floorId) => {
    setCurrentFloor(floorId);
  };
  
  const handleLocationSelect = (locationId) => {
    setCurrentLocation(locationId);
  };
  
  const handleDestinationSelect = (locationId) => {
    setDestination(locationId);
  };
  
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  const handleFindPath = () => {
    if (currentLocation && destination) {
      const routePath = findPath(currentLocation, destination);
      setPath(routePath);
      
      // Set floor to match the starting location if a path is found
      if (routePath && routePath.length > 0) {
        setCurrentFloor(roomData[routePath[0]].floor);
      }
    }
  };
  
  const handleSearchResult = (roomId, isDestination = false) => {
    if (isDestination) {
      setDestination(roomId);
    } else {
      setCurrentLocation(roomId);
      // Set floor to match the selected location
      setCurrentFloor(roomData[roomId].floor);
    }
  };
  
  const handleSwitchLocations = () => {
    if (currentLocation && destination) {
      const temp = currentLocation;
      setCurrentLocation(destination);
      setDestination(temp);
      
      // Set floor to match the new starting location
      setCurrentFloor(roomData[destination].floor);
    }
  };
  
  const handleReset = () => {
    setCurrentLocation(null);
    setDestination(null);
    setPath(null);
    setSelectedCategory(null);
    // Keep the current floor
  };
  
  // Fixed toggle panel function to prevent resetting selected locations
  const togglePanel = (e) => {
    // Stop event propagation to prevent the click from reaching the map
    if (e) {
      e.stopPropagation();
      e.preventDefault(); // Prevent any default behavior
    }
    
    // Simply toggle panel state without affecting other states
    setIsPanelCollapsed(prevState => !prevState);
  };
  
  // Filter room categories based on current floor
  const getFloorRoomsByCategory = (category) => {
    return roomCategories[category].filter(
      roomId => roomData[roomId].floor === currentFloor && roomId !== currentLocation
    );
  };
  
  // Get vertical transport options (stairs, elevators)
  const getVerticalTransports = () => {
    return Object.values(roomData).filter(room => 
      (room.type === 'facility') && 
      room.floor === currentFloor &&
      room.connections.some(connId => 
        roomData[connId] && roomData[connId].floor !== currentFloor
      )
    );
  };
  
  return (
    <div className="navigation-container">
      <div className="search-bar">
        <Search onSelect={handleSearchResult} />
      </div>
      
      {/* Always visible fixed-position toggle button */}
      <div 
        className="mobile-toggle-button" 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          togglePanel();
        }}
      >
        {isPanelCollapsed ? (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="white" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="white" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
          </svg>
        )}
      </div>
      
      <div className={`controls ${isPanelCollapsed ? 'collapsed' : ''}`}>
        <div className="toggle-panel" onClick={togglePanel}>
          {isPanelCollapsed ? (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#5F6368" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#5F6368" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
            </svg>
          )}
        </div>
        
        <div className="location-selection">
          <h3>
            <svg viewBox="0 0 24 24" width="20" height="20" className="section-icon">
              <path fill="#1a73e8" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Starting Point
          </h3>
          
          <p className="instructions">Click on the map to set your current location</p>
          
          {currentLocation && (
            <div className="selected-location">
              <div className="location-icon">A</div>
              <div className="location-details">
                <span className="location-name">{roomData[currentLocation].name}</span>
                <span className="location-type">
                  {roomData[currentLocation].type} • Floor {roomData[currentLocation].floor}
                </span>
              </div>
            </div>
          )}
          
          {/* Vertical transport options */}
          {getVerticalTransports().length > 0 && (
            <div className="vertical-transport-section">
              <h4>Floor Navigation</h4>
              <div className="vertical-transport-list">
                {getVerticalTransports().map(transport => (
                  <div 
                    key={transport.id}
                    className="vertical-transport-item"
                    onClick={() => handleLocationSelect(transport.id)}
                  >
                    <div className="transport-icon">
                      {transport.name.toLowerCase().includes('elevator') ? '🛗' : '🪜'}
                    </div>
                    <div className="transport-details">
                      <span className="transport-name">{transport.name}</span>
                      <span className="transport-floors">
                        Connects to: {transport.connections
                          .filter(connId => roomData[connId] && roomData[connId].floor !== currentFloor)
                          .map(connId => `Floor ${roomData[connId].floor}`)
                          .join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="destination-selection">
          <h3>
            <svg viewBox="0 0 24 24" width="20" height="20" className="section-icon">
              <path fill="#ea4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Destination
          </h3>
          
          <div className="category-buttons">
            {Object.keys(roomCategories)
              .filter(category => category !== 'hallways')
              .map(category => (
                <button 
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))
            }
          </div>
          
          {selectedCategory && (
            <>
              <select 
                onChange={(e) => handleDestinationSelect(e.target.value)}
                value={destination || ''}
                className="destination-select"
              >
                <option value="">Select a destination</option>
                {/* Group destinations by floor */}
                {Object.keys(floors).map(floorId => {
                  const floorRooms = roomCategories[selectedCategory].filter(
                    roomId => roomData[roomId].floor === parseInt(floorId) && roomId !== currentLocation
                  );
                  
                  return floorRooms.length > 0 ? (
                    <optgroup key={floorId} label={`Floor ${floorId}`}>
                      {floorRooms.map(roomId => (
                        <option key={roomId} value={roomId}>
                          {roomData[roomId].name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
              
              {/* Show warning if no rooms on current floor */}
              {getFloorRoomsByCategory(selectedCategory).length === 0 && (
                <p className="no-rooms-warning">
                  No {selectedCategory} on floor {currentFloor}. Please select a different category or floor.
                </p>
              )}
            </>
          )}
          
          {destination && (
            <div className="selected-destination">
              <div className="location-icon">B</div>
              <div className="location-details">
                <span className="location-name">{roomData[destination].name}</span>
                <span className="location-type">
                  {roomData[destination].type} • Floor {roomData[destination].floor}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="find-path-button"
            onClick={handleFindPath}
            disabled={!currentLocation || !destination}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="white" d="M21.71 11.29l-9-9a.996.996 0 00-1.41 0l-9 9a.996.996 0 000 1.41l9 9a.996.996 0 001.41 0l9-9a.996.996 0 000-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
            </svg>
            Find Path
          </button>
          
          <button 
            className="switch-button"
            onClick={handleSwitchLocations}
            disabled={!currentLocation || !destination}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#1a73e8" d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
            </svg>
            Switch
          </button>
          
          <button 
            className="reset-button"
            onClick={handleReset}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#d93025" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Reset
          </button>
        </div>
      </div>
      
      <Map 
        onLocationSelect={handleLocationSelect}
        currentLocation={currentLocation}
        destination={destination}
        path={path}
        currentFloor={currentFloor}
        onFloorChange={handleFloorChange}
      />
      
      {path && path.length > 0 && (
        <div className="directions-panel">
          <div className="directions-header">
            <h3>Directions</h3>
            <span 
              className="close-directions" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setPath(null);
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#5F6368" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </span>
          </div>
          
          <div className="directions-summary">
            <div className="summary-locations">
              <div className="summary-start">{roomData[currentLocation].name}</div>
              <div className="summary-arrow">→</div>
              <div className="summary-end">{roomData[destination].name}</div>
            </div>
            <div className="summary-time">
              {(() => {
                // Calculate distance and time
                let totalDistance = 0;
                let floorChanges = 0;
                let prevFloor = null;
                
                for (let i = 1; i < path.length; i++) {
                  const room1 = roomData[path[i-1]];
                  const room2 = roomData[path[i]];
                  
                  // Count floor changes
                  if (prevFloor !== null && room1.floor !== prevFloor) {
                    floorChanges++;
                  }
                  prevFloor = room1.floor;
                  
                  // If there's a floor change, add extra time
                  if (room1.floor !== room2.floor) {
                    floorChanges++;
                  }
                  
                  const distance = Math.sqrt(
                    Math.pow(room1.coordinates.x - room2.coordinates.x, 2) + 
                    Math.pow(room1.coordinates.y - room2.coordinates.y, 2)
                  );
                  
                  totalDistance += distance;
                }
                
                // Assume average walking speed (pixels per second)
                const walkingSpeed = 20; // pixels per second
                // Add extra time for floor changes (e.g., 30 seconds per floor change)
                const floorChangeTime = floorChanges * 30;
                const timeInSeconds = (totalDistance / walkingSpeed) + floorChangeTime;
                
                // Format time
                if (timeInSeconds < 60) {
                  return `${Math.round(timeInSeconds)} sec`;
                } else {
                  const minutes = Math.floor(timeInSeconds / 60);
                  const seconds = Math.round(timeInSeconds % 60);
                  return `${minutes} min ${seconds} sec`;
                }
              })()}
            </div>
          </div>
          
          <div className="directions-steps">
            <div className="step">
              <div className="step-icon start">A</div>
              <div className="step-details">
                <div className="step-text">
                  Start at <strong>{roomData[path[0]].name}</strong>
                  <span className="floor-tag">Floor {roomData[path[0]].floor}</span>
                </div>
              </div>
            </div>
            
            {/* Process directions with floor changes */}
            {(() => {
              const steps = [];
              let currentFloorInRoute = roomData[path[0]].floor;
              
              for (let i = 1; i < path.length; i++) {
                const prevRoom = roomData[path[i-1]];
                const currentRoom = roomData[path[i]];
                
                // Skip hallways unless they're floor transition points
                if (currentRoom.type === 'hallway' && 
                    currentRoom.floor === prevRoom.floor) {
                  continue;
                }
                
                // If there's a floor change, add a special step
                if (currentRoom.floor !== currentFloorInRoute) {
                  steps.push(
                    <div className="step floor-change-step" key={`floor-change-${i}`}>
                      <div className="step-icon floor-change">
                        {currentRoom.name.toLowerCase().includes('elevator') ? '🛗' : '🪜'}
                      </div>
                      <div className="step-details">
                        <div className="step-text">
                          Take {currentRoom.name.toLowerCase().includes('elevator') ? 'elevator' : 'stairs'} to 
                          <strong> Floor {currentRoom.floor}</strong>
                        </div>
                      </div>
                    </div>
                  );
                  
                  currentFloorInRoute = currentRoom.floor;
                }
                
                // Add regular waypoint if not a hallway
                if (currentRoom.type !== 'hallway') {
                  steps.push(
                    <div className="step" key={`waypoint-${i}`}>
                      <div className="step-icon waypoint"></div>
                      <div className="step-details">
                        <div className="step-text">
                          Continue through <strong>{currentRoom.name}</strong>
                          <span className="floor-tag">Floor {currentRoom.floor}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              }
              
              return steps;
            })()}
            
            <div className="step">
              <div className="step-icon destination">B</div>
              <div className="step-details">
                                  <div className="step-text">
                  Arrive at <strong>{roomData[path[path.length - 1]].name}</strong>
                  <span className="floor-tag">Floor {roomData[path[path.length - 1]].floor}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 4 */}
          {Array.from(new Set(path.map(id => roomData[id].floor))).length > 1 && (
            <div className="multi-floor-notice">
              <p><strong>Note:</strong> This route spans multiple floors.</p>
              <p>Use the floor selector in the top-left corner to view each part of your route.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navigation;