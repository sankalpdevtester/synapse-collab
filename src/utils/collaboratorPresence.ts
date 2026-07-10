// src/utils/collaboratorPresence.ts
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { performanceMonitor } from './performanceMonitor';
import { activityLogger } from './activityLogger';
import { collaborationUtils } from './collaborationUtils';
import { documentSync } from './documentSync';

interface Collaborator {
  id: string;
  username: string;
  documentId: string;
  lastSeen: number;
}

interface Presence {
  documentId: string;
  collaborators: Collaborator[];
}

class CollaboratorPresence {
  private presence: Presence[] = [];
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.init();
  }

  private init() {
    this.ws.on('message', (message: string) => {
      const data = JSON.parse(message);
      if (data.type === 'join') {
        this.joinDocument(data.documentId, data.username);
      } else if (data.type === 'leave') {
        this.leaveDocument(data.documentId, data.username);
      }
    });
  }

  private joinDocument(documentId: string, username: string) {
    const existingPresence = this.presence.find((p) => p.documentId === documentId);
    if (existingPresence) {
      existingPresence.collaborators.push({
        id: uuidv4(),
        username,
        documentId,
        lastSeen: Date.now(),
      });
    } else {
      this.presence.push({
        documentId,
        collaborators: [
          {
            id: uuidv4(),
            username,
            documentId,
            lastSeen: Date.now(),
          },
        ],
      });
    }
    this.broadcastPresence(documentId);
  }

  private leaveDocument(documentId: string, username: string) {
    const existingPresence = this.presence.find((p) => p.documentId === documentId);
    if (existingPresence) {
      existingPresence.collaborators = existingPresence.collaborators.filter(
        (c) => c.username !== username
      );
      if (existingPresence.collaborators.length === 0) {
        this.presence = this.presence.filter((p) => p.documentId !== documentId);
      }
    }
    this.broadcastPresence(documentId);
  }

  private broadcastPresence(documentId: string) {
    const presence = this.presence.find((p) => p.documentId === documentId);
    if (presence) {
      this.ws.send(
        JSON.stringify({
          type: 'presence',
          documentId,
          collaborators: presence.collaborators,
        })
      );
    }
  }

  public getCollaborators(documentId: string) {
    const presence = this.presence.find((p) => p.documentId === documentId);
    return presence ? presence.collaborators : [];
  }
}

export const collaboratorPresence = new CollaboratorPresence(new WebSocket('ws://localhost:8080'));

// Example usage:
// const collaborators = collaboratorPresence.getCollaborators('document-123');
// console.log(collaborators);

// Integrate with existing files:
// src/features/collaborativeEditor.tsx
import React, { useState, useEffect } from 'react';
import { collaboratorPresence } from '../utils/collaboratorPresence';

const CollaborativeEditor = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [documentId, setDocumentId] = useState('document-123');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const collaborators = collaboratorPresence.getCollaborators(documentId);
      setCollaborators(collaborators);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [documentId]);

  return (
    <div>
      <h1>Collaborative Editor</h1>
      <ul>
        {collaborators.map((collaborator) => (
          <li key={collaborator.id}>{collaborator.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default CollaborativeEditor;