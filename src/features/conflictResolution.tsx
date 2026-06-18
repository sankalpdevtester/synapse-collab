import React, { useState, useEffect } from 'react';
import { CRDT } from '../utils/crdt';
import { collaborationUtils } from '../utils/collaborationUtils';

interface ConflictResolutionProps {
  wsUrl: string;
}

const ConflictResolution: React.FC<ConflictResolutionProps> = ({ wsUrl }) => {
  const [document, setDocument] = useState('');
  const [ws, setWs] = useState<any | null>(null);
  const [crdt, setCrdt] = useState<CRDT | null>(null);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    setWs(ws);
    const documentSync = collaborationUtils.createDocumentSync();
    const crdt = collaborationUtils.createCRDT(ws, documentSync);
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

export default ConflictResolution;