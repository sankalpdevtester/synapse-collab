import React, { useState, useEffect } from 'react';
import { WebSocket } from 'ws';
import { CRDT } from 'crdt';
import { CodeEditor } from './codeEditor';

interface CodeCompletionProps {
  ws: WebSocket;
  crdt: CRDT;
  code: string;
}

const CodeCompletion: React.FC<CodeCompletionProps> = ({ ws, crdt, code }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  useEffect(() => {
    const handleCodeChange = (newCode: string) => {
      const cursorPosition = newCode.length;
      setCursorPosition(cursorPosition);
      const suggestions = getSuggestions(newCode, cursorPosition);
      setSuggestions(suggestions);
    };

    crdt.on('change', handleCodeChange);
    return () => {
      crdt.off('change', handleCodeChange);
    };
  }, [crdt]);

  const getSuggestions = (code: string, cursorPosition: number) => {
    const mlModel = new MLModel();
    const suggestions = mlModel.predict(code, cursorPosition);
    return suggestions;
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newCode = code.substring(0, cursorPosition) + suggestion + code.substring(cursorPosition);
    crdt.applyOperation(newCode);
  };

  return (
    <div>
      <CodeEditor code={code} />
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

class MLModel {
  predict(code: string, cursorPosition: number) {
    // Simple machine learning model that returns a list of suggestions
    // based on the code and cursor position
    const suggestions = [
      'console.log',
      'console.error',
      'console.warn',
    ];
    return suggestions;
  }
}

export default CodeCompletion;