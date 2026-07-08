// src/utils/activityLogger.ts
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { collaborationUtils } from './collaborationUtils';
import { cacheManager } from './cacheManager';
import { performanceMonitor } from './performanceMonitor';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  documentId: string;
}

class ActivityLogger {
  private activityLogs: ActivityLog[] = [];
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  logActivity(action: string, userId: string, documentId: string) {
    const activityLog: ActivityLog = {
      id: uuidv4(),
      userId,
      action,
      timestamp: Date.now(),
      documentId,
    };
    this.activityLogs.push(activityLog);
    this.broadcastActivityLog(activityLog);
    this.cacheActivityLog(activityLog);
    this.monitorPerformance(activityLog);
  }

  broadcastActivityLog(activityLog: ActivityLog) {
    collaborationUtils.broadcastMessage(this.ws, 'activityLog', activityLog);
  }

  cacheActivityLog(activityLog: ActivityLog) {
    cacheManager.set(`activityLog:${activityLog.id}`, activityLog);
  }

  monitorPerformance(activityLog: ActivityLog) {
    performanceMonitor.logEvent('activityLog', activityLog);
  }

  getActivityLogs(documentId: string) {
    return this.activityLogs.filter((log) => log.documentId === documentId);
  }
}

const activityLogger = new ActivityLogger(new WebSocket('ws://localhost:8080'));

export { activityLogger };

// Example usage:
// activityLogger.logActivity('insert', 'user1', 'document1');
// activityLogger.logActivity('delete', 'user2', 'document1');
// console.log(activityLogger.getActivityLogs('document1'));