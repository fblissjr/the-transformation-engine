import type { IDBPDatabase } from "idb";
import type { TokenUsage, TaskId } from "../types/providers";
import { getDB } from "./db/indexedDbService";

/**
 * TokenTrackingService class
 *
 * Tracks and manages token usage statistics for AI operations.
 * Records input/output tokens, costs, and provides breakdowns by provider and task.
 * Supports session-based tracking and exporting data.
 */
export class TokenTrackingService {
  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
  }

  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Record token usage
  /**
   * Records a new token usage entry.
   *
   * @param usage - The usage data (excluding ID and timestamp).
   * @returns The created TokenUsage record.
   */
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
  /**
   * Retrieves all token usage records for the current session.
   *
   * @returns An array of TokenUsage records.
   */
  async getSessionUsage(): Promise<TokenUsage[]> {
    const db = await this.getDb();
    const all = await db.getAll("tokenUsage");
    return all.filter((u) => u.timestamp >= this.sessionStartTime);
  }

  // Get usage by provider
  /**
   * Retrieves token usage records for a specific provider.
   *
   * @param providerId - The ID of the provider.
   * @returns An array of TokenUsage records.
   */
  async getUsageByProvider(providerId: string): Promise<TokenUsage[]> {
    const db = await this.getDb();
    return db.getAllFromIndex("tokenUsage", "providerId", providerId);
  }

  // Get usage by task
  /**
   * Retrieves token usage records for a specific task.
   *
   * @param taskId - The ID of the task.
   * @returns An array of TokenUsage records.
   */
  async getUsageByTask(taskId: TaskId): Promise<TokenUsage[]> {
    const db = await this.getDb();
    return db.getAllFromIndex("tokenUsage", "taskId", taskId);
  }

  // Get session totals
  /**
   * Calculates the total token usage and cost for the current session.
   *
   * @returns An object containing total input, output, total tokens, cost, and request count.
   */
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
  /**
   * Generates a breakdown of token usage by provider for the current session.
   *
   * @returns An array of objects summarizing usage per provider.
   */
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
  /**
   * Generates a breakdown of token usage by task for the current session.
   *
   * @returns An array of objects summarizing usage per task.
   */
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
  /**
   * Exports session usage logs as a JSON Blob.
   *
   * @returns A Blob containing the JSON data.
   */
  async exportUsageLogsJSON(): Promise<Blob> {
    const all = await this.getSessionUsage();
    const json = JSON.stringify(all, null, 2);
    return new Blob([json], { type: "application/json" });
  }

  // Export usage logs as CSV
  /**
   * Exports session usage logs as a CSV Blob.
   *
   * @returns A Blob containing the CSV data.
   */
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
  /**
   * Resets the session start time, effectively clearing session stats without deleting data.
   */
  resetSession(): void {
    this.sessionStartTime = Date.now();
  }

  // Clear all usage data (destructive!)
  /**
   * Permanently deletes all token usage data from the database.
   */
  async clearAllUsageData(): Promise<void> {
    const db = await this.getDb();
    const all = await db.getAll("tokenUsage");

    for (const usage of all) {
      await db.delete("tokenUsage", usage.id);
    }

    this.sessionStartTime = Date.now();
  }

  // Get usage for specific time range
  /**
   * Retrieves usage records within a specific time range.
   *
   * @param startTime - The start timestamp (inclusive).
   * @param endTime - The end timestamp (inclusive).
   * @returns An array of TokenUsage records.
   */
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
  /**
   * Retrieves usage records for the last N hours.
   *
   * @param hours - The number of hours to look back.
   * @returns An array of TokenUsage records.
   */
  async getUsageLastHours(hours: number): Promise<TokenUsage[]> {
    const endTime = Date.now();
    const startTime = endTime - hours * 60 * 60 * 1000;
    return this.getUsageInRange(startTime, endTime);
  }
}

export const tokenTrackingService = new TokenTrackingService();
