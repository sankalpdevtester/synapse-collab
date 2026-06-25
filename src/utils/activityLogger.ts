// src/utils/activityLogger.ts
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { CollaborationUtils } from './collaborationUtils';
import { CacheManager } from './cacheManager';
import { Crdt } from './crdt';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  documentId: string;
}

class ActivityLogger {
  private activityLogs: ActivityLog[] = [];
  private cacheManager: CacheManager;
  private collaborationUtils: CollaborationUtils;
  private crdt: Crdt;

  constructor(cacheManager: CacheManager, collaborationUtils: CollaborationUtils, crdt: Crdt) {
    this.cacheManager = cacheManager;
    this.collaborationUtils = collaborationUtils;
    this.crdt = crdt;
  }

  public logActivity(userId: string, action: string, documentId: string): void {
    const activityLog: ActivityLog = {
      id: uuidv4(),
      userId,
      action,
      timestamp: Date.now(),
      documentId,
    };
    this.activityLogs.push(activityLog);
    this.cacheManager.set(`activityLog:${documentId}`, this.activityLogs);
    this.collaborationUtils.broadcastActivityLog(activityLog);
  }

  public getActivityLogs(documentId: string): ActivityLog[] {
    const cachedActivityLogs = this.cacheManager.get(`activityLog:${documentId}`);
    if (cachedActivityLogs) {
      return cachedActivityLogs;
    }
    return [];
  }

  public clearActivityLogs(documentId: string): void {
    this.cacheManager.delete(`activityLog:${documentId}`);
    this.activityLogs = this.activityLogs.filter((log) => log.documentId !== documentId);
  }
}

export const activityLogger = new ActivityLogger(new CacheManager(), new CollaborationUtils(), new Crdt());
``}

// src/features/collaborativeEditor.tsx (updated to use activityLogger)
```typescript
// ...
import { activityLogger } from '../utils/activityLogger';

const CollaborativeEditor = () => {
  // ...
  const handleEdit = (userId: string, action: string, documentId: string) => {
    activityLogger.logActivity(userId, action, documentId);
    // ...
  };
  // ...
};

export default CollaborativeEditor;
``}

// src/routes/collaboration.ts (updated to use activityLogger)
```typescript
// ...
import { activityLogger } from '../utils/activityLogger';

const collaborationRouter = Router();
collaborationRouter.get('/activityLogs/:documentId', (req: Request, res: Response) => {
  const documentId = req.params.documentId;
  const activityLogs = activityLogger.getActivityLogs(documentId);
  res.json(activityLogs);
});

export default collaborationRouter;
``}