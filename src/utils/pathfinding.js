// src/utils/pathfinding.js

import { roomData } from '../data/locations';

const getDistance = (a, b) => {
  const roomA = roomData[a];
  const roomB = roomData[b];
  const floorPenalty = roomA.floor !== roomB.floor ? 1000 : 0;
  
  const distance = Math.sqrt(
    Math.pow(roomA.coordinates.x - roomB.coordinates.x, 2) +
    Math.pow(roomA.coordinates.y - roomB.coordinates.y, 2)
  );
  
  return distance + floorPenalty;
};

export const findPath = (startId, endId) => {

  if (startId === endId) {
    return [startId];
  }

 
  const openSet = [startId];
  const closedSet = [];
  const cameFrom = {};
  const gScore = {};
  gScore[startId] = 0;
  const fScore = {};
  fScore[startId] = getDistance(startId, endId);
  
  while (openSet.length > 0) {
    
    let current = openSet.reduce((lowest, nodeId) => {
      if (!lowest) return nodeId;
      return fScore[nodeId] < fScore[lowest] ? nodeId : lowest;
    }, null);
    
    if (current === endId) {
      const path = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      
      return optimizePath(path);
    }
    

    openSet.splice(openSet.indexOf(current), 1);
    closedSet.push(current);
    
    const neighbors = roomData[current].connections || [];
    
    for (const neighbor of neighbors) {

      if (closedSet.includes(neighbor)) continue;

      const tentativeGScore = gScore[current] + getDistance(current, neighbor);
      
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore[neighbor] || Infinity)) {
        continue;
      }
      
      cameFrom[neighbor] = current;
      gScore[neighbor] = tentativeGScore;
      fScore[neighbor] = gScore[neighbor] + getDistance(neighbor, endId);
    }
  }
  
  // No path found
  return null;
};

const optimizePath = (path) => {
  if (path.length <= 2) return path;
  
  const optimizedPath = [path[0]];
  
  for (let i = 1; i < path.length - 1; i++) {
    const prev = roomData[path[i-1]];
    const current = roomData[path[i]];
    const next = roomData[path[i+1]];
  
    if (current.type !== 'hallway' || 
        prev.floor !== current.floor || 
        current.floor !== next.floor || 
        current.connections.length > 2) {
      optimizedPath.push(path[i]);
    }
  }

  optimizedPath.push(path[path.length - 1]);
  
  return optimizedPath;
};