// src/utils/performanceMonitor.ts
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';
import { collaborationUtils } from './collaborationUtils';

interface PerformanceMetric {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  public startMetric(type: string): string {
    const id = uuidv4();
    const startTime = performance.now();
    this.metrics.push({ id, startTime, endTime: 0, duration: 0, type });
    return id;
  }

  public endMetric(id: string): void {
    const metric = this.metrics.find((m) => m.id === id);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      collaborationUtils.logMetric(metric);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }
}

const performanceMonitor = new PerformanceMonitor();

export { performanceMonitor };

// Example usage:
// const metricId = performanceMonitor.startMetric('codeCompletion');
// // code completion logic here
// performanceMonitor.endMetric(metricId);

// In src/features/codeCompletion.tsx:
import { performanceMonitor } from '../utils/performanceMonitor';

const CodeCompletion = () => {
  const metricId = performanceMonitor.startMetric('codeCompletion');
  // code completion logic here
  performanceMonitor.endMetric(metricId);
  return <div>Code Completion</div>;
};

// In src/utils/collaborationUtils.ts:
import { performanceMonitor } from './performanceMonitor';

export const logMetric = (metric: PerformanceMetric) => {
  console.log(`Metric: ${metric.type}, Duration: ${metric.duration}ms`);
  // Send metric to server or analytics service
};