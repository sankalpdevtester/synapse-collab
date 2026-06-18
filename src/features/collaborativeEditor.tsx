import React, { useState, useEffect } from 'react';
import { CRDT } from '../utils/crdt';
import { DocumentSync } from '../utils/documentSync';
import { WebSocket } from 'ws';

interface CollaborativeEditorProps {
  wsUrl: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ wsUrl }) => {
  const [document, setDocument] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [crdt, setCrdt] = useState<CRDT | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setWs(ws);
    const documentSync = new DocumentSync();
    const crdt = new CRDT(ws, documentSync);
    setCrdt(crdt);
    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const handleInsert = (text: string, position: number) => {
    if (crdt) {
      crdt.insert(text, position);
    }
  };

  const handleDelete = (text: string, position: number) => {
    if (crdt) {
      crdt.delete(text, position);
    }
  };

  const handleDocumentChange = (newDocument: string) => {
    setDocument(newDocument);
  };

  return (
    <div>
      <textarea value={document} onChange={(e) => handleDocumentChange(e.target.value)} />
      <button onClick={() => handleInsert('Hello, World!', 0)}>Insert</button>
      <button onClick={() => handleDelete('Hello, World!', 0)}>Delete</button>
    </div>
  );
};

export default CollaborativeEditor;