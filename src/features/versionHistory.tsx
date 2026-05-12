```typescript
// src/features/versionHistory.tsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCodeEditor } from '../hooks/useCodeEditor';

interface VersionHistoryProps {
  code: string;
  onChange: (code: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ code, onChange }) => {
  const [versions, setVersions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { send } = useWebSocket();
  const { editor } = useCodeEditor();

  useEffect(() => {
    const handleCodeChange = (newCode: string) => {
      setVersions((prevVersions) => [...prevVersions, newCode]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    editor.on('change', handleCodeChange);

    return () => {
      editor.off('change', handleCodeChange);
    };
  }, [editor]);

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      onChange(versions[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < versions.length) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      onChange(versions[currentIndex]);
    }
  };

  const handleSaveVersion = () => {
    send('save-version', code);
  };

  return (
    <div>
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={handleSaveVersion}>Save Version</button>
      <ul>
        {versions.map((version, index) => (
          <li key={index}>{version.substring(0, 100)}...</li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory;
```

```typescript
// src/hooks/useVersionHistory.ts
import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

interface UseVersionHistory {
  versions: string[];
  currentIndex: number;
  undo: () => void;
  redo: () => void;
  saveVersion: () => void;
}

const useVersionHistory = (): UseVersionHistory => {
  const [versions, setVersions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { send, onMessage } = useWebSocket();

  useEffect(() => {
    onMessage('version-history', (versions: string[]) => {
      setVersions(versions);
    });
  }, [onMessage]);

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < versions.length) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const saveVersion = () => {
    send('save-version', versions);
  };

  return { versions, currentIndex, undo, redo, saveVersion };
};

export default useVersionHistory;
```

```typescript
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import CodeEditor from './CodeEditor';
import VersionHistory from './features/versionHistory';

const App = () => {
  const [code, setCode] = React.useState('');

  return (
    <div>
      <CodeEditor code={code} onChange={setCode} />
      <VersionHistory code={code} onChange={setCode} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```