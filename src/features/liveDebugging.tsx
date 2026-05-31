import React, { useState, useEffect } from 'react';
import { WebSocket } from 'ws';
import { OperationalTransform } from '../utils/operationalTransform';
import { CRDT } from '../utils/crdt';

interface LiveDebuggingProps {
  code: string;
  userId: string;
}

const LiveDebugging: React.FC<LiveDebuggingProps> = ({ code, userId }) => {
  const [consoleOutput, setConsoleOutput] = useState('');
  const [error, setError] = useState(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `ws://localhost:8080/debug/${userId}`;
    const wsOptions = {
      // WebSocket options
    };

    const ws = new WebSocket(wsUrl, wsOptions);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'consoleOutput') {
        setConsoleOutput(message.output);
      } else if (message.type === 'error') {
        setError(message.error);
      }
    };

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'init', code }));
    };

    ws.onclose = () => {
      setWs(null);
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    setWs(ws);

    return () => {
      ws.close();
    };
  }, [code, userId]);

  const handleCodeChange = (newCode: string) => {
    ws?.send(JSON.stringify({ type: 'codeChange', code: newCode }));
  };

  return (
    <div>
      <h2>Live Debugging</h2>
      <pre>
        <code>{consoleOutput}</code>
      </pre>
      {error && (
        <div style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <button onClick={() => handleCodeChange(code)}>Run Code</button>
    </div>
  );
};

export default LiveDebugging;
```

```typescript
// src/utils/debugServer.ts
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { OperationalTransform } from './operationalTransform';
import { CRDT } from './crdt';

const debugServer = createServer();

const wss = new WebSocketServer({ server: debugServer });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    if (data.type === 'init') {
      // Initialize debug session
      const code = data.code;
      const userId = data.userId;
      // ...
    } else if (data.type === 'codeChange') {
      // Handle code change
      const newCode = data.code;
      // ...
    }
  });

  ws.on('close', () => {
    // Handle connection close
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

debugServer.listen(8080, () => {
  console.log('Debug server listening on port 8080');
});
```

```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import LiveDebugging from './features/liveDebugging';

const App = () => {
  const [code, setCode] = React.useState('');
  const [userId, setUserId] = React.useState('user1');

  return (
    <div>
      <LiveDebugging code={code} userId={userId} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));