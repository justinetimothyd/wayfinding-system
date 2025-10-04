// src/components/Map/index.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './styles.css';
import { roomData, floors } from '../../data/locations';

const Map = ({ onLocationSelect, currentLocation, destination, path, currentFloor, onFloorChange }) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const svgRef = useRef(null);
  
  const floorPlanUrl = process.env.PUBLIC_URL + floors[currentFloor].image;
  
  const getCurrentFloorRooms = () => {
    return Object.values(roomData).filter(room => room.floor === currentFloor);
  };
  
  const handleMapClick = (event) => {
    if (!onLocationSelect || isDragging) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    const clientX = event.type.includes('touch') 
      ? event.changedTouches[0].clientX 
      : event.clientX;
    const clientY = event.type.includes('touch') 
      ? event.changedTouches[0].clientY 
      : event.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * viewBox.width - pan.x;
    const y = ((clientY - rect.top) / rect.height) * viewBox.height - pan.y;
    
    let minDist = Infinity;
    let nearest = null;
    
    getCurrentFloorRooms().forEach(room => {
      if (room.type === 'hallway') return; // Skip hallways
      
      const dist = Math.sqrt(
        Math.pow(x - room.coordinates.x, 2) + 
        Math.pow(y - room.coordinates.y, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = room.id;
      }
    });
    
    if (nearest && minDist < 50) {
      onLocationSelect(nearest);
    }
  };
  
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.2, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale / 1.2, 0.5));
  };
  
  const handlePointerDown = useCallback((event) => {
    if (event.type === 'touchstart') {
      event.preventDefault();
    }
    
    setIsDragging(true);
    
    const clientX = event.type === 'touchstart' 
      ? event.touches[0].clientX 
      : event.clientX;
    const clientY = event.type === 'touchstart' 
      ? event.touches[0].clientY 
      : event.clientY;
    
    setDragStart({ x: clientX, y: clientY });
  }, []);
  
  const handlePointerMove = useCallback((event) => {
    if (!isDragging) return;
    
    if (event.type === 'touchmove') {
      event.preventDefault();
    }
    
    const clientX = event.type === 'touchmove' 
      ? event.touches[0].clientX 
      : event.clientX;
    const clientY = event.type === 'touchmove' 
      ? event.touches[0].clientY 
      : event.clientY;
    
    const dx = (clientX - dragStart.x) / scale;
    const dy = (clientY - dragStart.y) / scale;
    
    setPan(prev => ({ 
      x: prev.x + dx, 
      y: prev.y + dy 
    }));
    
    setDragStart({ x: clientX, y: clientY });
  }, [isDragging, dragStart, scale]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleRoomHover = (roomId) => {
    setHoveredRoom(roomId);
  };
  
  const handleRoomLeave = () => {
    setHoveredRoom(null);
  };
  
  const handleFloorChange = (floorId) => {
    if (onFloorChange) {
      onFloorChange(floorId);
    }
  };

  useEffect(() => {
    // Mouse events
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('mousemove', handlePointerMove);
    
    // Touch events
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    
    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('mousemove', handlePointerMove);
      
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [handlePointerMove, handlePointerUp]);
  
  // Calculate travel time based on path length
  const calculateTravelTime = () => {
    if (!path || path.length < 2) return null;

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
    
    const walkingSpeed = 20; // pixels per seconde)
    const floorChangeTime = floorChanges * 30;
    const timeInSeconds = (totalDistance / walkingSpeed) + floorChangeTime;
    
    // Format time
    if (timeInSeconds < 60) {
      return `${Math.round(timeInSeconds)} seconds`;
    } else {
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.round(timeInSeconds % 60);
      return `${minutes} min ${seconds} sec`;
    }
  };
  
  return (
    <div className="map-container">
      {/* Floor selector */}
      <div className="floor-selector">
        {Object.values(floors).map(floor => (
          <button
            key={floor.id}
            className={`floor-button ${currentFloor === floor.id ? 'active' : ''}`}
            onClick={() => handleFloorChange(floor.id)}
          >
            {floor.name}
          </button>
        ))}
      </div>
      
      <div className="zoom-controls">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>−</button>
      </div>
      
      <svg 
        ref={svgRef}
        className="campus-map" 
        viewBox="0 0 1200 800" 
        onClick={handleMapClick}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onTouchEnd={handleMapClick}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none' // Prevents browser handling of touch gestures
        }}
      >
        {/* Background or floor plan */}
        <image
          href={floorPlanUrl}
          x="0"
          y="0"
          width="1200"
          height="800"
          preserveAspectRatio="xMidYMid slice"
          opacity="0.3"
          style={{ 
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)` 
          }}
        />
        
        {/* Fallback background color */}
        <rect width="1200" height="800" fill="#f8f8f8" opacity="0.7" />
        
        {/* Main map content with transformation */}
        <g style={{ 
          transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)` 
        }}>
          {/* Hallways and connections on current floor */}
          {getCurrentFloorRooms()
            .filter(room => room.type === 'hallway')
            .map(hallway => {
              // Draw connections between hallways on the same floor
              const connections = hallway.connections
                .filter(id => roomData[id] && roomData[id].type === 'hallway' && roomData[id].floor === currentFloor)
                .map(id => {
                  const connected = roomData[id];
                  return (
                    <line
                      key={`${hallway.id}-${id}`}
                      x1={hallway.coordinates.x}
                      y1={hallway.coordinates.y}
                      x2={connected.coordinates.x}
                      y2={connected.coordinates.y}
                      className="hallway-line"
                    />
                  );
                });
                
              return (
                <React.Fragment key={hallway.id}>
                  {connections}
                  <circle
                    cx={hallway.coordinates.x}
                    cy={hallway.coordinates.y}
                    r="4"
                    className="hallway-point"
                  />
                </React.Fragment>
              );
            })}
          
          {/* Room connections to hallways on current floor */}
          {getCurrentFloorRooms()
            .filter(room => room.type !== 'hallway')
            .map(room => {
              return room.connections
                .filter(connId => roomData[connId] && roomData[connId].floor === currentFloor)
                .map(connId => {
                  const connectedRoom = roomData[connId];
                  return (
                    <line
                      key={`${room.id}-${connId}`}
                      x1={room.coordinates.x}
                      y1={room.coordinates.y}
                      x2={connectedRoom.coordinates.x}
                      y2={connectedRoom.coordinates.y}
                      className="connection-line"
                    />
                  );
                });
            })}
          
          {/* Draw rooms on current floor */}
          {getCurrentFloorRooms()
            .filter(room => room.type !== 'hallway')
            .map(room => {
              // Determine if this is a narrow room
              const isNarrow = room.dimensions.width < 50;
              
              // Highlight floor transition points
              const isFloorTransition = room.connections.some(
                connId => roomData[connId] && roomData[connId].floor !== currentFloor
              );
              
              return (
                <g 
                  key={room.id}
                  onMouseEnter={() => handleRoomHover(room.id)}
                  onMouseLeave={handleRoomLeave}
                >
                  <rect 
                    x={room.coordinates.x - room.dimensions.width/2} 
                    y={room.coordinates.y - room.dimensions.height/2} 
                    width={room.dimensions.width} 
                    height={room.dimensions.height}
                    className={`room ${currentLocation === room.id ? 'current' : ''} 
                               ${destination === room.id ? 'destination' : ''} 
                               ${isFloorTransition ? 'floor-transition' : ''}`}
                    rx="3"
                    ry="3"
                    data-room-id={room.id}
                  />
                  
                  {/* Use different class for narrow rooms */}
                  <text 
                    x={room.coordinates.x} 
                    y={room.coordinates.y} 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    className={isNarrow ? "room-label narrow-room-label" : "room-label"}
                  >
                    {room.name}
                  </text>
                  
                  {/* Floor transition icon for stairs/elevators */}
                  {isFloorTransition && (
                    <svg 
                      x={room.coordinates.x - 10} 
                      y={room.coordinates.y - room.dimensions.height/2 - 15}
                      width="20" 
                      height="15" 
                      viewBox="0 0 24 24"
                      className="floor-transition-icon"
                    >
                      <path d="M19 3L13 9l-2-2-6 6 2 2-4 4 2 2 4-4 2 2 6-6-2-2 6-6-2-2z" />
                    </svg>
                  )}
                </g>
              );
            })}
            
          {/* Draw the navigation path if exists and includes the current floor */}
          {path && path.length > 1 && (
            <>
              {/* Draw path segments on the current floor */}
              {Array.from({ length: path.length - 1 }, (_, i) => i).map(i => {
                const room1 = roomData[path[i]];
                const room2 = roomData[path[i + 1]];
                
                // Only draw path segments where both rooms are on the current floor
                if (room1.floor === currentFloor && room2.floor === currentFloor) {
                  return (
                    <line
                      key={`path-${i}`}
                      x1={room1.coordinates.x}
                      y1={room1.coordinates.y}
                      x2={room2.coordinates.x}
                      y2={room2.coordinates.y}
                      className="path-line"
                    />
                  );
                }
                
                // Mark floor transition points
                if (room1.floor === currentFloor && room2.floor !== currentFloor) {
                  return (
                    <g key={`transition-${i}`}>
                      <circle
                        cx={room1.coordinates.x}
                        cy={room1.coordinates.y}
                        r="8"
                        className="floor-transition-point"
                      />
                      <text
                        x={room1.coordinates.x}
                        y={room1.coordinates.y - 15}
                        textAnchor="middle"
                        className="floor-transition-text"
                      >
                        To Floor {room2.floor}
                      </text>
                    </g>
                  );
                }
                
                return null;
              })}
            </>
          )}
        </g>
        
        {/* Room tooltip */}
        {hoveredRoom && (
          <foreignObject
            x={roomData[hoveredRoom].coordinates.x * scale + pan.x - 75}
            y={(roomData[hoveredRoom].coordinates.y - 40) * scale + pan.y}
            width="150"
            height="30"
            className="tooltip-container"
          >
            <div className="room-tooltip">
              <strong>{roomData[hoveredRoom].name}</strong>
              <span>({roomData[hoveredRoom].type})</span>
            </div>
          </foreignObject>
        )}
      </svg>
      
      <div className="map-instructions">
        {currentLocation ? 
          <p>Starting from: <strong>{roomData[currentLocation].name}</strong> (Floor {roomData[currentLocation].floor})</p> : 
          <p>Click on a room to set your current location</p>
        }
        {destination && 
          <p>Destination: <strong>{roomData[destination].name}</strong> (Floor {roomData[destination].floor})</p>
        }
        {path && path.length > 0 && (
          <>
            <p>Follow the blue line to reach your destination</p>
            {path.some(locId => roomData[locId].floor !== currentFloor) && (
              <p className="floor-change-warning">
                This route requires changing floors. Look for the <span className="floor-icon">↕</span> markers.
              </p>
            )}
            <p className="travel-time">
              <span className="time-icon">⏱</span> Estimated time: <strong>{calculateTravelTime()}</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Map;