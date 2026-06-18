import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { DocumentSync } from './documentSync';

interface Operation {
  id: string;
  type: 'insert' | 'delete';
  position: number;
  text: string;
}

class CRDT {
  private operations: Operation[] = [];
  private document: string = '';

  constructor(private ws: WebSocket, private documentSync: DocumentSync) {
    this.ws.on('message', (message: string) => {
      const operation: Operation = JSON.parse(message);
      this.applyOperation(operation);
    });
  }

  applyOperation(operation: Operation) {
    switch (operation.type) {
      case 'insert':
        this.document = this.document.slice(0, operation.position) + operation.text + this.document.slice(operation.position);
        break;
      case 'delete':
        this.document = this.document.slice(0, operation.position) + this.document.slice(operation.position + operation.text.length);
        break;
    }
    this.operations.push(operation);
    this.documentSync.updateDocument(this.document);
  }

  sendOperation(operation: Operation) {
    this.ws.send(JSON.stringify(operation));
  }

  insert(text: string, position: number) {
    const operation: Operation = {
      id: uuidv4(),
      type: 'insert',
      position,
      text,
    };
    this.applyOperation(operation);
    this.sendOperation(operation);
  }

  delete(text: string, position: number) {
    const operation: Operation = {
      id: uuidv4(),
      type: 'delete',
      position,
      text,
    };
    this.applyOperation(operation);
    this.sendOperation(operation);
  }
}

export { CRDT };