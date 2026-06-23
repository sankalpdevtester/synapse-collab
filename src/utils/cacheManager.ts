// src/utils/cacheManager.ts
import { v4 as uuidv4 } from 'uuid';
import { setTimeout, clearTimeout } from 'timers';
import { CRDT } from 'src/utils/crdt';

interface CacheItem {
  id: string;
  document: any;
  ttl: number;
  expiresAt: number;
}

class CacheManager {
  private cache: { [id: string]: CacheItem } = {};
  private ttl: number = 60 * 1000; // 1 minute

  constructor() {
    this.init();
  }

  private init() {
    // Initialize cache with existing documents
    const documents = CRDT.getDocuments();
    documents.forEach((document) => {
      this.cacheDocument(document);
    });
  }

  public cacheDocument(document: any) {
    const id = uuidv4();
    const cacheItem: CacheItem = {
      id,
      document,
      ttl: this.ttl,
      expiresAt: Date.now() + this.ttl,
    };
    this.cache[id] = cacheItem;
    this.scheduleExpiration(id);
  }

  public getDocument(id: string) {
    const cacheItem = this.cache[id];
    if (cacheItem && cacheItem.expiresAt > Date.now()) {
      return cacheItem.document;
    }
    return null;
  }

  public updateDocument(id: string, document: any) {
    const cacheItem = this.cache[id];
    if (cacheItem) {
      cacheItem.document = document;
      cacheItem.expiresAt = Date.now() + this.ttl;
      this.scheduleExpiration(id);
    }
  }

  public deleteDocument(id: string) {
    const cacheItem = this.cache[id];
    if (cacheItem) {
      delete this.cache[id];
    }
  }

  private scheduleExpiration(id: string) {
    const cacheItem = this.cache[id];
    if (cacheItem) {
      const timeout = setTimeout(() => {
        this.deleteDocument(id);
      }, cacheItem.ttl);
      cacheItem.timeout = timeout;
    }
  }

  public clearCache() {
    Object.keys(this.cache).forEach((id) => {
      const cacheItem = this.cache[id];
      if (cacheItem.timeout) {
        clearTimeout(cacheItem.timeout);
      }
      delete this.cache[id];
    });
  }
}

const cacheManager = new CacheManager();

export { cacheManager };
```
```typescript
// src/features/collaborativeEditor.tsx
import React, { useState, useEffect } from 'react';
import { cacheManager } from 'src/utils/cacheManager';

const CollaborativeEditor = () => {
  const [document, setDocument] = useState(null);

  useEffect(() => {
    const id = 'document-123';
    const cachedDocument = cacheManager.getDocument(id);
    if (cachedDocument) {
      setDocument(cachedDocument);
    } else {
      // Fetch document from server
      fetchDocument(id).then((document) => {
        setDocument(document);
        cacheManager.cacheDocument(document);
      });
    }
  }, []);

  return (
    <div>
      <h1>Collaborative Editor</h1>
      {document && <Editor document={document} />}
    </div>
  );
};

export default CollaborativeEditor;
```
```typescript
// src/utils/documentSync.ts
import { cacheManager } from 'src/utils/cacheManager';

const documentSync = {
  syncDocument: (id: string, document: any) => {
    cacheManager.updateDocument(id, document);
  },
};

export default documentSync;