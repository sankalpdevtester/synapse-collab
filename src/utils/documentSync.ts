// src/utils/documentSync.ts
import { v4 as uuidv4 } from 'uuid';
import { CRDT } from 'crdt';
import { WebSocket } from 'ws';
import { collaborationUtils } from './collaborationUtils';

interface DocumentSyncOptions {
  docId: string;
  userId: string;
  ws: WebSocket;
}

class DocumentSync {
  private docId: string;
  private userId: string;
  private ws: WebSocket;
  private crdt: CRDT;
  private doc: any;

  constructor(options: DocumentSyncOptions) {
    this.docId = options.docId;
    this.userId = options.userId;
    this.ws = options.ws;
    this.crdt = new CRDT();
    this.doc = {};
  }

  public init() {
    this.ws.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'docUpdate') {
        this.handleDocUpdate(data);
      }
    });
  }

  private handleDocUpdate(data: any) {
    const update = data.update;
    const userId = data.userId;
    if (userId !== this.userId) {
      this.crdt.applyUpdate(update);
      this.doc = this.crdt.getState();
      collaborationUtils.broadcastUpdate(this.ws, this.docId, update);
    }
  }

  public updateDocument(update: any) {
    this.crdt.applyUpdate(update);
    this.doc = this.crdt.getState();
    collaborationUtils.broadcastUpdate(this.ws, this.docId, update);
  }

  public getDocument() {
    return this.doc;
  }
}

export { DocumentSync };

// Example usage:
// const ws = new WebSocket('ws://localhost:8080');
// const docId = uuidv4();
// const userId = uuidv4();
// const documentSync = new DocumentSync({ docId, userId, ws });
// documentSync.init();
// documentSync.updateDocument({ type: 'insert', text: 'Hello World' });
// console.log(documentSync.getDocument());