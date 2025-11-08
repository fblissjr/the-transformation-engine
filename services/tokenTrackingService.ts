import type { IDBPDatabase } from "idb";
import type { TokenUsage, TaskId } from "../types/providers";
import { getDB } from "./db/indexedDbService";

export class TokenTrackingService {
  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
  }

  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Record token usage
  async recordUsage(
    usage: Omit<TokenUsage, "id" | "timestamp">
  ): Promise<TokenUsage> {
    const db = await this.getDb();
    const record: TokenUsage = {
      ...usage,
      id: `usage_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };

    await db.put("tokenUsage", record);
    return record;
  }

  // Get session usage (since app loaded or session reset)
  async getSessionUsage(): Promise<TokenUsage[]> {
    const db = await this.getDb();
    const all = await db.getAll("tokenUsage");
    return all.filter((u) => u.timestamp >= this.sessionStartTime);
  }

  // Get usage by provider
  async getUsageByProvider(providerId: string): Promise<TokenUsage[]> {
    const db = await this.getDb();
    return db.getAllFromIndex("tokenUsage", "providerId", providerId);
  }

  // Get usage by task
  async getUsageByTask(taskId: TaskId): Promise<TokenUsage[]> {
    const db = await this.getDb();
    return db.getAllFromIndex("tokenUsage", "taskId", taskId);
  }

  // Get session totals
  async getSessionTotals(): Promise<{
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    totalCost: number;
    count: number;
  }> {
    const sessionUsage = await this.getSessionUsage();

    return sessionUsage.reduce(
      (acc, usage) => ({
        inputTokens: acc.inputTokens + usage.inputTokens,
        outputTokens: acc.outputTokens + usage.outputTokens,
        totalTokens: acc.totalTokens + usage.inputTokens + usage.outputTokens,
        totalCost: acc.totalCost + (usage.cost || 0),
        count: acc.count + 1,
      }),
      {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        count: 0,
      }
    );
  }

  // Get breakdown by provider
  async getProviderBreakdown(): Promise<
    Array<{
      providerId: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      cost: number;
      count: number;
    }>
  > {
    const sessionUsage = await this.getSessionUsage();
    const breakdown = new Map<string, any>();

    for (const usage of sessionUsage) {
      const existing = breakdown.get(usage.providerId) || {
        providerId: usage.providerId,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        count: 0,
      };

      existing.inputTokens += usage.inputTokens;
      existing.outputTokens += usage.outputTokens;
      existing.totalTokens += usage.inputTokens + usage.outputTokens;
      existing.cost += usage.cost || 0;
      existing.count += 1;

      breakdown.set(usage.providerId, existing);
    }

    return Array.from(breakdown.values());
  }

  // Get breakdown by task
  async getTaskBreakdown(): Promise<
    Array<{
      taskId: TaskId;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      cost: number;
      count: number;
    }>
  > {
    const sessionUsage = await this.getSessionUsage();
    const breakdown = new Map<TaskId, any>();

    for (const usage of sessionUsage) {
      const taskId = usage.taskId as TaskId;
      const existing = breakdown.get(taskId) || {
        taskId,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cost: 0,
        count: 0,
      };

      existing.inputTokens += usage.inputTokens;
      existing.outputTokens += usage.outputTokens;
      existing.totalTokens += usage.inputTokens + usage.outputTokens;
      existing.cost += usage.cost || 0;
      existing.count += 1;

      breakdown.set(taskId, existing);
    }

    return Array.from(breakdown.values());
  }

  // Export usage logs as JSON
  async exportUsageLogsJSON(): Promise<Blob> {
    const all = await this.getSessionUsage();
    const json = JSON.stringify(all, null, 2);
    return new Blob([json], { type: "application/json" });
  }

  // Export usage logs as CSV
  async exportUsageLogsCSV(): Promise<Blob> {
    const all = await this.getSessionUsage();
    const headers = [
      "timestamp",
      "taskId",
      "providerId",
      "modelId",
      "inputTokens",
      "outputTokens",
      "totalTokens",
      "cost",
    ];

    const rows = all.map((u) => [
      new Date(u.timestamp).toISOString(),
      u.taskId,
      u.providerId,
      u.modelId,
      u.inputTokens,
      u.outputTokens,
      u.inputTokens + u.outputTokens,
      u.cost || 0,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return new Blob([csv], { type: "text/csv" });
  }

  // Reset session (clears session start time, doesn't delete data)
  resetSession(): void {
    this.sessionStartTime = Date.now();
  }

  // Clear all usage data (destructive!)
  async clearAllUsageData(): Promise<void> {
    const db = await this.getDb();
    const all = await db.getAll("tokenUsage");

    for (const usage of all) {
      await db.delete("tokenUsage", usage.id);
    }

    this.sessionStartTime = Date.now();
  }

  // Get usage for specific time range
  async getUsageInRange(
    startTime: number,
    endTime: number
  ): Promise<TokenUsage[]> {
    const db = await this.getDb();
    const all = await db.getAll("tokenUsage");
    return all.filter(
      (u) => u.timestamp >= startTime && u.timestamp <= endTime
    );
  }

  // Get usage for last N hours
  async getUsageLastHours(hours: number): Promise<TokenUsage[]> {
    const endTime = Date.now();
    const startTime = endTime - hours * 60 * 60 * 1000;
    return this.getUsageInRange(startTime, endTime);
  }
}

export const tokenTrackingService = new TokenTrackingService();
