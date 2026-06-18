import express, { Request, Response } from 'express';
import { WebSocket } from 'ws';
import { CRDT } from '../utils/crdt';

const router = express.Router();

router.get('/collaboration', (req: Request, res: Response) => {
  const ws = new WebSocket('ws://localhost:8080');
  const crdt = new CRDT(ws, new (class DocumentSync {
    updateDocument(document: string) {
      console.log('Document updated:', document);
    }
  })());
  res.send('Collaboration route');
});

export default router;