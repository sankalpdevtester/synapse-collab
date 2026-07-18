// src/utils/cacheManager.ts
import { v4 as uuidv4 } from 'uuid';
import { CollaboratorPresence } from './collaboratorPresence';
import { DocumentSync } from './documentSync';

interface CacheItem {
  id: string;
  data: any;
  ttl: number;
  expiresAt: number;
}

class CacheManager {
  private cache: { [key: string]: CacheItem } = {};
  private intervalId: NodeJS.Timeout;

  constructor() {
    this.intervalId = setInterval(this.cleanupCache, 60000); // cleanup every 1 minute
  }

  public getCacheItem(key: string): CacheItem | undefined {
    return this.cache[key];
  }

  public setCacheItem(key: string, data: any, ttl: number = 300000): void { // default TTL is 5 minutes
    const id = uuidv4();
    const expiresAt = Date.now() + ttl;
    this.cache[key] = { id, data, ttl, expiresAt };
  }

  public deleteCacheItem(key: string): void {
    delete this.cache[key];
  }

  private cleanupCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      const item = this.cache[key];
      if (item.expiresAt < now) {
        delete this.cache[key];
      }
    });
  }

  public getCollaboratorPresenceCache(collaboratorId: string): CollaboratorPresence | undefined {
    const cacheItem = this.getCacheItem(`collaborator:${collaboratorId}`);
    if (cacheItem) {
      return cacheItem.data as CollaboratorPresence;
    }
    return undefined;
  }

  public setCollaboratorPresenceCache(collaboratorId: string, presence: CollaboratorPresence): void {
    this.setCacheItem(`collaborator:${collaboratorId}`, presence);
  }

  public getDocumentSyncCache(documentId: string): DocumentSync | undefined {
    const cacheItem = this.getCacheItem(`document:${documentId}`);
    if (cacheItem) {
      return cacheItem.data as DocumentSync;
    }
    return undefined;
  }

  public setDocumentSyncCache(documentId: string, sync: DocumentSync): void {
    this.setCacheItem(`document:${documentId}`, sync);
  }
}

const cacheManager = new CacheManager();

export { cacheManager };