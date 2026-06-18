import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { Document } from 'src/utils/documentSync';

interface CRDT {
  id: string;
  type: 'insert' | 'delete';
  position: number;
  text: string;
}

class CRDTImpl {
  private crdt: CRDT[];
  private document: Document;

  constructor(document: Document) {
    this.crdt = [];
    this.document = document;
  }

  insert(position: number, text: string) {
    const crdt: CRDT = {
      id: uuidv4(),
      type: 'insert',
      position,
      text,
    };
    this.crdt.push(crdt);
    this.applyCRDT(crdt);
  }

  delete(position: number, length: number) {
    const crdt: CRDT = {
      id: uuidv4(),
      type: 'delete',
      position,
      text: '',
    };
    this.crdt.push(crdt);
    this.applyCRDT(crdt);
  }

  applyCRDT(crdt: CRDT) {
    switch (crdt.type) {
      case 'insert':
        this.document.insert(crdt.position, crdt.text);
        break;
      case 'delete':
        this.document.delete(crdt.position, crdt.text.length);
        break;
    }
  }

  getCRDTs() {
    return this.crdt;
  }
}

export { CRDTImpl };