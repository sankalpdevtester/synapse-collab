// src/utils/autoSave.ts
import { v4 as uuidv4 } from 'uuid';
import { CRDT } from '../utils/crdt';
import { CacheManager } from '../utils/cacheManager';
import { CacheManagerExtensions } from '../utils/cacheManagerExtensions';
import { CollaborationUtils } from '../utils/collaborationUtils';
import { ActivityLogger } from '../utils/activityLogger';

interface AutoSaveOptions {
  interval: number;
  versionHistory: boolean;
}

class AutoSave {
  private intervalId: NodeJS.Timeout;
  private cacheManager: CacheManager;
  private crdt: CRDT;
  private collaborationUtils: CollaborationUtils;
  private activityLogger: ActivityLogger;

  constructor(options: AutoSaveOptions) {
    this.cacheManager = new CacheManager();
    this.crdt = new CRDT();
    this.collaborationUtils = new CollaborationUtils();
    this.activityLogger = new ActivityLogger();

    this.intervalId = setInterval(() => {
      this.autoSave();
    }, options.interval);

    if (options.versionHistory) {
      this.cacheManagerExtensions = new CacheManagerExtensions();
    }
  }

  private autoSave() {
    const currentCode = this.collaborationUtils.getCurrentCode();
    const userId = this.collaborationUtils.getUserId();
    const versionId = uuidv4();

    this.crdt.applyOperation({
      type: 'insert',
      text: currentCode,
      position: 0,
    });

    this.cacheManager.set(`code-${versionId}`, currentCode);
    this.cacheManagerExtensions?.setVersionHistory(versionId, currentCode);

    this.activityLogger.logActivity(`Auto-saved code version ${versionId} for user ${userId}`);
  }

  public stopAutoSave() {
    clearInterval(this.intervalId);
  }

  public getSavedVersions() {
    return this.cacheManagerExtensions?.getVersionHistory();
  }
}

export { AutoSave, AutoSaveOptions };
```
```typescript
// example usage in src/index.tsx
import React from 'react';
import { AutoSave, AutoSaveOptions } from './utils/autoSave';

const autoSaveOptions: AutoSaveOptions = {
  interval: 10000, // 10 seconds
  versionHistory: true,
};

const autoSave = new AutoSave(autoSaveOptions);

// stop auto-save when component unmounts
React.useEffect(() => {
  return () => {
    autoSave.stopAutoSave();
  };
}, []);

// get saved versions
const savedVersions = autoSave.getSavedVersions();
console.log(savedVersions);