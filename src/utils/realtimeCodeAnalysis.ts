import { CRDT } from './crdt';
import { DocumentSync } from './documentSync';
import { CodeAnalysis } from './codeAnalysis';
import { WebSocket } from 'ws';

interface RealtimeCodeAnalysisOptions {
  crdt: CRDT;
  documentSync: DocumentSync;
  codeAnalysis: CodeAnalysis;
}

class RealtimeCodeAnalysis {
  private crdt: CRDT;
  private documentSync: DocumentSync;
  private codeAnalysis: CodeAnalysis;
  private ws: WebSocket;

  constructor(options: RealtimeCodeAnalysisOptions) {
    this.crdt = options.crdt;
    this.documentSync = options.documentSync;
    this.codeAnalysis = options.codeAnalysis;
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.on('open', () => {
      console.log('Connected to WebSocket server');
    });

    this.ws.on('message', (message) => {
      const data = JSON.parse(message);
      if (data.type === 'codeUpdate') {
        this.analyzeCode(data.code);
      }
    });
  }

  analyzeCode(code: string) {
    const analysisResult = this.codeAnalysis.analyze(code);
    const suggestions = analysisResult.suggestions;
    const errors = analysisResult.errors;

    this.ws.send(JSON.stringify({
      type: 'analysisResult',
      suggestions,
      errors,
    }));

    this.documentSync.updateCode(code);
    this.crdt.applyOperation({
      type: 'codeUpdate',
      code,
    });
  }

  start() {
    this.ws.send(JSON.stringify({
      type: 'init',
    }));
  }
}

export { RealtimeCodeAnalysis };
