// src/utils/collaborationUtils.ts
import { v4 as uuidv4 } from 'uuid';
import { OperationalTransform } from 'otjs';
import { WebSocket } from 'ws';

interface Collaborator {
  id: string;
  username: string;
  cursorPosition: number;
}

interface CodeChange {
  operation: string;
  text: string;
  position: number;
}

class CollaborationUtils {
  private collaborators: { [id: string]: Collaborator };
  private operationalTransform: OperationalTransform;
  private webSocket: WebSocket;

  constructor(webSocket: WebSocket) {
    this.collaborators = {};
    this.operationalTransform = new OperationalTransform();
    this.webSocket = webSocket;
  }

  addCollaborator(collaborator: Collaborator) {
    this.collaborators[collaborator.id] = collaborator;
    this.broadcastCollaborators();
  }

  removeCollaborator(id: string) {
    delete this.collaborators[id];
    this.broadcastCollaborators();
  }

  applyCodeChange(codeChange: CodeChange) {
    const transformedOperation = this.operationalTransform.transform(codeChange.operation, codeChange.text, codeChange.position);
    this.broadcastCodeChange(transformedOperation);
  }

  private broadcastCollaborators() {
    const collaboratorsList = Object.values(this.collaborators);
    this.webSocket.send(JSON.stringify({ type: 'collaborators', data: collaboratorsList }));
  }

  private broadcastCodeChange(codeChange: CodeChange) {
    this.webSocket.send(JSON.stringify({ type: 'codeChange', data: codeChange }));
  }
}

export function createCollaborationUtils(webSocket: WebSocket) {
  return new CollaborationUtils(webSocket);
}

export function generateCollaboratorId() {
  return uuidv4();
}

export function createInitialCodeChange(operation: string, text: string, position: number) {
  return { operation, text, position };
}

export function isCollaboratorOnline(collaborators: { [id: string]: Collaborator }, id: string) {
  return collaborators[id] !== undefined;
}