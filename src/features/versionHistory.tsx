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
