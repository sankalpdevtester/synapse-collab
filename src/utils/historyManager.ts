// src/utils/historyManager.ts
import { v4 as uuidv4 } from 'uuid';
import { CRDT } from 'src/utils/crdt';
import { CollaborativeEditor } from 'src/features/collaborativeEditor';
import { DocumentSync } from 'src/utils/documentSync';

interface HistoryEntry {
  id: string;
  timestamp: number;
  operation: string;
  data: any;
}

class HistoryManager {
  private history: HistoryEntry[] = [];
  private crdt: CRDT;
  private collaborativeEditor: CollaborativeEditor;
  private documentSync: DocumentSync;

  constructor(crdt: CRDT, collaborativeEditor: CollaborativeEditor, documentSync: DocumentSync) {
    this.crdt = crdt;
    this.collaborativeEditor = collaborativeEditor;
    this.documentSync = documentSync;
  }

  public recordHistory(operation: string, data: any): void {
    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      operation,
      data,
    };
    this.history.push(historyEntry);
  }

  public undo(): void {
    if (this.history.length > 0) {
      const lastHistoryEntry = this.history.pop();
      if (lastHistoryEntry) {
        switch (lastHistoryEntry.operation) {
          case 'insert':
            this.crdt.delete(lastHistoryEntry.data);
            break;
          case 'delete':
            this.crdt.insert(lastHistoryEntry.data);
            break;
          case 'update':
            this.crdt.update(lastHistoryEntry.data);
            break;
          default:
            break;
        }
        this.collaborativeEditor.updateEditorState();
        this.documentSync.syncDocument();
      }
    }
  }

  public redo(): void {
    if (this.history.length > 0) {
      const lastHistoryEntry = this.history[this.history.length - 1];
      if (lastHistoryEntry) {
        switch (lastHistoryEntry.operation) {
          case 'insert':
            this.crdt.insert(lastHistoryEntry.data);
            break;
          case 'delete':
            this.crdt.delete(lastHistoryEntry.data);
            break;
          case 'update':
            this.crdt.update(lastHistoryEntry.data);
            break;
          default:
            break;
        }
        this.collaborativeEditor.updateEditorState();
        this.documentSync.syncDocument();
      }
    }
  }

  public clearHistory(): void {
    this.history = [];
  }
}

export { HistoryManager };
```
```typescript
// src/features/collaborativeEditor.tsx (updated)
import React, { useState, useEffect } from 'react';
import { CRDT } from 'src/utils/crdt';
import { DocumentSync } from 'src/utils/documentSync';
import { HistoryManager } from 'src/utils/historyManager';

const CollaborativeEditor = () => {
  const [editorState, setEditorState] = useState<any>({});
  const crdt = new CRDT();
  const documentSync = new DocumentSync();
  const historyManager = new HistoryManager(crdt, CollaborativeEditor, documentSync);

  useEffect(() => {
    // Initialize history manager
    historyManager.clearHistory();
  }, []);

  const handleInsert = (data: any) => {
    crdt.insert(data);
    historyManager.recordHistory('insert', data);
  };

  const handleDelete = (data: any) => {
    crdt.delete(data);
    historyManager.recordHistory('delete', data);
  };

  const handleUpdate = (data: any) => {
    crdt.update(data);
    historyManager.recordHistory('update', data);
  };

  const handleUndo = () => {
    historyManager.undo();
  };

  const handleRedo = () => {
    historyManager.redo();
  };

  return (
    <div>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      {/* Editor component */}
    </div>
  );
};

export default CollaborativeEditor;
``}