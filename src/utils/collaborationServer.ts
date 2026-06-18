import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'ws';
import { router } from 'src/routes/collaboration';

const app: Application = express();
const httpServer = createServer(app);
const wss = new Server({ server: httpServer });

app.use(express.json());
app.use('/api', router);

wss.on('connection', (ws: any) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.log('Error occurred:', error);
  });
});

httpServer.listen(8080, () => {
  console.log('Server listening on port 8080');
});