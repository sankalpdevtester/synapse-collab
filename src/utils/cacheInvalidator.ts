import { v4 as uuidv4 } from 'uuid';
import { CacheManager } from './cacheManager';
import { CollaborationUtils } from './collaborationUtils';
import { DocumentSync } from './documentSync';

interface CacheInvalidationOptions {
  documentId: string;
  userId: string;
  cacheManager: CacheManager;
}

class CacheInvalidator {
  private cacheManager: CacheManager;
  private documentId: string;
  private userId: string;

  constructor(options: CacheInvalidationOptions) {
    this.cacheManager = options.cacheManager;
    this.documentId = options.documentId;
    this.userId = options.userId;
  }

  public invalidateCache(): void {
    const cacheKey = this.getCacheKey();
    this.cacheManager.delete(cacheKey);
  }

  public getCacheKey(): string {
    return `document-${this.documentId}-user-${this.userId}`;
  }

  public async invalidateCacheForAllUsers(): Promise<void> {
    const users = await CollaborationUtils.getCollaborators(this.documentId);
    users.forEach((user) => {
      const cacheKey = `document-${this.documentId}-user-${user.id}`;
      this.cacheManager.delete(cacheKey);
    });
  }

  public async invalidateCacheOnDocumentUpdate(): Promise<void> {
    const documentUpdates = await DocumentSync.getDocumentUpdates(this.documentId);
    documentUpdates.forEach((update) => {
      const cacheKey = `document-${this.documentId}-user-${update.userId}`;
      this.cacheManager.delete(cacheKey);
    });
  }
}

export { CacheInvalidator };

// Example usage:
const cacheManager = new CacheManager();
const collaborationUtils = new CollaborationUtils();
const documentSync = new DocumentSync();

const cacheInvalidator = new CacheInvalidator({
  documentId: 'document-123',
  userId: 'user-123',
  cacheManager,
});

cacheInvalidator.invalidateCache();

// Integrate with existing files
import { autoSave } from './autoSave';
import { crdt } from './crdt';

autoSave.addEventListener('save', () => {
  cacheInvalidator.invalidateCache();
});

crdt.addEventListener('update', () => {
  cacheInvalidator.invalidateCacheOnDocumentUpdate();
});