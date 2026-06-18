import express, { Request, Response } from 'express';
import { CRDTImpl } from 'src/utils/crdt';
import { Document } from 'src/utils/documentSync';
import { WebSocket } from 'ws';

const router = express.Router();

router.post('/crdt', (req: Request, res: Response) => {
  const crdt = req.body;
  const document = new Document();
  const crdtImpl = new CRDTImpl(document);
  crdt.forEach((crdtItem: CRDT) => {
    crdtImpl.applyCRDT(crdtItem);
  });
  res.json(crdtImpl.getCRDTs());
});

router.get('/document', (req: Request, res: Response) => {
  const document = new Document();
  res.json(document.getText());
});

router.websocket('/collaboration', (ws: WebSocket) => {
  ws.on('message', (message) => {
    const crdt = JSON.parse(message.toString());
    ws.send(JSON.stringify(crdt));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.log('Error occurred:', error);
  });
});

export { router };