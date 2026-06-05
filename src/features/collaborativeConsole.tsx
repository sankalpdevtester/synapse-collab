import React, { useState, useEffect } from 'react';
import { WebSocket } from 'ws';
import { OperationalTransform } from './operationalTransform';
import { CRDT } from './crdt';

interface ConsoleMessage {
  userId: string;
  message: string;
}

interface CollaborativeConsoleProps {
  userId: string;
  wsUrl: string;
}

const CollaborativeConsole: React.FC<CollaborativeConsoleProps> = ({ userId, wsUrl }) => {
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsUrlWithUserId = `${wsUrl}?userId=${userId}`;
    const wsConnection = new WebSocket(wsUrlWithUserId);
    setWs(wsConnection);

    wsConnection.onmessage = (event) => {
      const consoleMessage: ConsoleMessage = JSON.parse(event.data);
      setConsoleMessages((prevMessages) => [...prevMessages, consoleMessage]);
    };

    wsConnection.onclose = () => {
      setWs(null);
    };

    return () => {
      wsConnection.close();
    };
  }, [wsUrl, userId]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (ws) {
      const consoleMessage: ConsoleMessage = {
        userId,
        message: inputValue,
      };
      ws.send(JSON.stringify(consoleMessage));
      setInputValue('');
    }
  };

  return (
    <div>
      <h2>Collaborative Console</h2>
      <ul>
        {consoleMessages.map((message, index) => (
          <li key={index}>
            <span style={{ color: 'blue' }}>{message.userId}:</span>
            <span>{message.message}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleInputSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default CollaborativeConsole;
```

```typescript
// src/features/operationalTransform.ts
interface OperationalTransform {
  transform(message: ConsoleMessage): ConsoleMessage;
}

class OperationalTransformImpl implements OperationalTransform {
  transform(message: ConsoleMessage): ConsoleMessage {
    // Implement operational transform logic here
    return message;
  }
}

export { OperationalTransformImpl };
```

```typescript
// src/features/crdt.ts
interface CRDT {
  applyOperation(message: ConsoleMessage): void;
}

class CRDTImpl implements CRDT {
  private operations: ConsoleMessage[] = [];

  applyOperation(message: ConsoleMessage): void {
    this.operations.push(message);
  }

  getOperations(): ConsoleMessage[] {
    return this.operations;
  }
}

export { CRDTImpl };
```

```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import CollaborativeConsole from './features/collaborativeConsole';

const App = () => {
  return (
    <div>
      <CollaborativeConsole userId="user1" wsUrl="ws://localhost:8080" />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));