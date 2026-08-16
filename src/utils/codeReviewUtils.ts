// src/utils/codeReviewUtils.ts
import { CollaboratorPresence } from './collaboratorPresence';
import { CacheManager } from './cacheManager';
import { DocumentSync } from './documentSync';
import { RealtimeCodeAnalysis } from './realtimeCodeAnalysis';

interface CodeReviewComment {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

interface CodeReview {
  id: string;
  comments: CodeReviewComment[];
  documentId: string;
}

class CodeReviewUtils {
  private cacheManager: CacheManager;
  private collaboratorPresence: CollaboratorPresence;
  private documentSync: DocumentSync;
  private realtimeCodeAnalysis: RealtimeCodeAnalysis;

  constructor(
    cacheManager: CacheManager,
    collaboratorPresence: CollaboratorPresence,
    documentSync: DocumentSync,
    realtimeCodeAnalysis: RealtimeCodeAnalysis
  ) {
    this.cacheManager = cacheManager;
    this.collaboratorPresence = collaboratorPresence;
    this.documentSync = documentSync;
    this.realtimeCodeAnalysis = realtimeCodeAnalysis;
  }

  async createCodeReview(documentId: string): Promise<CodeReview> {
    const codeReview: CodeReview = {
      id: this.generateId(),
      comments: [],
      documentId,
    };

    await this.cacheManager.set(`code-review:${codeReview.id}`, codeReview);
    return codeReview;
  }

  async addComment(codeReviewId: string, comment: CodeReviewComment): Promise<void> {
    const codeReview = await this.getCodeReview(codeReviewId);
    if (codeReview) {
      codeReview.comments.push(comment);
      await this.cacheManager.set(`code-review:${codeReviewId}`, codeReview);
    }
  }

  async getCodeReview(codeReviewId: string): Promise<CodeReview | null> {
    const codeReview = await this.cacheManager.get(`code-review:${codeReviewId}`);
    return codeReview as CodeReview | null;
  }

  async getComments(codeReviewId: string): Promise<CodeReviewComment[]> {
    const codeReview = await this.getCodeReview(codeReviewId);
    return codeReview ? codeReview.comments : [];
  }

  async resolveComment(codeReviewId: string, commentId: string): Promise<void> {
    const codeReview = await this.getCodeReview(codeReviewId);
    if (codeReview) {
      codeReview.comments = codeReview.comments.filter((comment) => comment.id !== commentId);
      await this.cacheManager.set(`code-review:${codeReviewId}`, codeReview);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export { CodeReviewUtils, CodeReviewComment, CodeReview };