import React, { useState, useEffect } from 'react';
import { CRDTImpl } from 'src/utils/crdt';
import { Document } from 'src/utils/documentSync';
import { WebSocket } from 'ws';

interface CollaborativeEditorProps {
  document: Document;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ document }) => {
  const [crdt, setCRDT] = useState<CRDTImpl>(new CRDTImpl(document));
  const [ws, setWS] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = 'ws://localhost:8080';
    const wsOptions = {
      // WebSocket options
    };
    const ws = new WebSocket(wsUrl, wsOptions);
    setWS(ws);

    ws.onmessage = (event) => {
      const crdt = JSON.parse(event.data);
      crdt.forEach((crdtItem: CRDT) => {
        setCRDT((prevCRDT) => {
          prevCRDT.applyCRDT(crdtItem);
          return prevCRDT;
        });
      });
    };

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (event) => {
      console.log('Error occurred:', event);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleInsert = (position: number, text: string) => {
    crdt.insert(position, text);
    ws?.send(JSON.stringify(crdt.getCRDTs()));
  };

  const handleDelete = (position: number, length: number) => {
    crdt.delete(position, length);
    ws?.send(JSON.stringify(crdt.getCRDTs()));
  };

  return (
    <div>
      <textarea
        value={document.getText()}
        onChange={(event) => {
          const text = event.target.value;
          const position = event.target.selectionStart;
          const length = event.target.selectionEnd - position;
          if (length > 0) {
            handleDelete(position, length);
          }
          handleInsert(position, text.substring(position));
        }}
      />
    </div>
  );
};

export { CollaborativeEditor };