// src/utils/cacheManagerExtensions.ts
import { CacheManager } from './cacheManager';
import { DocumentSync } from './documentSync';
import { CollaborationUtils } from './collaborationUtils';
import { ActivityLogger } from './activityLogger';
import { PerformanceMonitor } from './performanceMonitor';

interface CacheStatistics {
  hits: number;
  misses: number;
  invalidations: number;
}

class CacheManagerExtensions {
  private cacheManager: CacheManager;
  private documentSync: DocumentSync;
  private collaborationUtils: CollaborationUtils;
  private activityLogger: ActivityLogger;
  private performanceMonitor: PerformanceMonitor;
  private cacheStatistics: CacheStatistics;

  constructor(
    cacheManager: CacheManager,
    documentSync: DocumentSync,
    collaborationUtils: CollaborationUtils,
    activityLogger: ActivityLogger,
    performanceMonitor: PerformanceMonitor
  ) {
    this.cacheManager = cacheManager;
    this.documentSync = documentSync;
    this.collaborationUtils = collaborationUtils;
    this.activityLogger = activityLogger;
    this.performanceMonitor = performanceMonitor;
    this.cacheStatistics = { hits: 0, misses: 0, invalidations: 0 };
  }

  async invalidateCache(documentId: string): Promise<void> {
    await this.cacheManager.invalidateCache(documentId);
    this.cacheStatistics.invalidations++;
    this.activityLogger.log(`Cache invalidated for document ${documentId}`);
  }

  async getCacheStatistics(): Promise<CacheStatistics> {
    return this.cacheStatistics;
  }

  async trackCacheHit(): Promise<void> {
    this.cacheStatistics.hits++;
  }

  async trackCacheMiss(): Promise<void> {
    this.cacheStatistics.misses++;
  }

  async getDocumentFromCache(documentId: string): Promise<string | null> {
    const document = await this.cacheManager.getCache(documentId);
    if (document) {
      this.trackCacheHit();
      return document;
    } else {
      this.trackCacheMiss();
      return null;
    }
  }

  async updateDocumentInCache(documentId: string, document: string): Promise<void> {
    await this.cacheManager.updateCache(documentId, document);
    this.activityLogger.log(`Cache updated for document ${documentId}`);
  }

  async syncDocumentWithCollaborators(documentId: string): Promise<void> {
    const collaborators = await this.collaborationUtils.getCollaboratorsForDocument(documentId);
    for (const collaborator of collaborators) {
      await this.documentSync.syncDocumentWithCollaborator(documentId, collaborator);
    }
  }

  async monitorPerformance(): Promise<void> {
    this.performanceMonitor.monitorCachePerformance(this.cacheStatistics);
  }
}

export { CacheManagerExtensions };