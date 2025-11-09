import type { IDBPDatabase } from "idb";
import type { TaskAssignment, TaskId } from "../types/providers";
import { TASK_METADATA } from "../types/providers";
import { getDB } from "./db/indexedDbService";

export class TaskAssignmentService {
  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Get task assignment for a specific task
  async getTaskAssignment(taskId: TaskId): Promise<TaskAssignment | null> {
    const db = await this.getDb();
    const assignment = await db.get("taskAssignments", taskId);
    return assignment || null;
  }

  // Set/update task assignment
  async setTaskAssignment(assignment: TaskAssignment): Promise<void> {
    const db = await this.getDb();
    assignment.updatedAt = Date.now();
    await db.put("taskAssignments", assignment);
  }

  // Get all task assignments
  async getAllTaskAssignments(): Promise<TaskAssignment[]> {
    const db = await this.getDb();
    return db.getAll("taskAssignments");
  }

  // Create default task assignment for a task
  async createDefaultAssignment(
    taskId: TaskId,
    providerId: string,
    modelId: string
  ): Promise<TaskAssignment> {
    const metadata = TASK_METADATA[taskId];
    const assignment: TaskAssignment = {
      taskId,
      providerId,
      modelId,
      enableRewrite: false,
      enableStreaming: false,
      temperature: metadata.defaultTemperature,
      maxTokens: metadata.defaultMaxTokens,
      topP: 0.95,
      updatedAt: Date.now(),
    };

    await this.setTaskAssignment(assignment);
    return assignment;
  }

  // Get global default provider/model (from app settings)
  async getGlobalDefault(): Promise<{
    providerId: string;
    modelId: string;
  } | null> {
    const db = await this.getDb();
    const setting = await db.get("appSettings", "globalDefaultProvider");
    if (!setting) return null;
    return {
      providerId: setting.providerId,
      modelId: setting.modelId,
    };
  }

  // Set global default provider/model
  async setGlobalDefault(
    providerId: string,
    modelId: string
  ): Promise<void> {
    const db = await this.getDb();
    await db.put("appSettings", {
      id: "globalDefaultProvider",
      providerId,
      modelId,
    });
  }

  // Get or create task assignment (with fallback to global default)
  async getOrCreateAssignment(taskId: TaskId): Promise<TaskAssignment> {
    let assignment = await this.getTaskAssignment(taskId);

    if (!assignment) {
      // No assignment exists, create default
      const globalDefault = await this.getGlobalDefault();

      console.log(`[TaskAssignment] No assignment for ${taskId}, using global default:`, globalDefault);

      if (globalDefault) {
        assignment = await this.createDefaultAssignment(
          taskId,
          globalDefault.providerId,
          globalDefault.modelId
        );
      } else {
        // No global default either - this shouldn't happen after migration
        throw new Error(
          "No task assignment or global default found. Please configure providers."
        );
      }
    } else {
      console.log(`[TaskAssignment] Found existing assignment for ${taskId}:`, {
        providerId: assignment.providerId,
        modelId: assignment.modelId,
      });
    }

    return assignment;
  }

  // Reset task assignment to global default
  async resetToGlobalDefault(taskId: TaskId): Promise<void> {
    const globalDefault = await this.getGlobalDefault();
    if (!globalDefault) {
      throw new Error("No global default configured");
    }

    const metadata = TASK_METADATA[taskId];
    const assignment: TaskAssignment = {
      taskId,
      providerId: globalDefault.providerId,
      modelId: globalDefault.modelId,
      enableRewrite: false,
      enableStreaming: false,
      temperature: metadata.defaultTemperature,
      maxTokens: metadata.defaultMaxTokens,
      topP: 0.95,
      updatedAt: Date.now(),
    };

    await this.setTaskAssignment(assignment);
  }

  // Copy assignment from one task to another
  async copyAssignment(fromTaskId: TaskId, toTaskId: TaskId): Promise<void> {
    const sourceAssignment = await this.getTaskAssignment(fromTaskId);
    if (!sourceAssignment) {
      throw new Error(`Source task ${fromTaskId} has no assignment`);
    }

    const newAssignment: TaskAssignment = {
      ...sourceAssignment,
      taskId: toTaskId,
      updatedAt: Date.now(),
    };

    await this.setTaskAssignment(newAssignment);
  }

  // Apply same assignment to all tasks
  async applyToAllTasks(
    providerId: string,
    modelId: string,
    enableStreaming: boolean = false
  ): Promise<void> {
    const db = await this.getDb();
    const taskIds = Object.keys(TASK_METADATA) as TaskId[];

    for (const taskId of taskIds) {
      const metadata = TASK_METADATA[taskId];
      const assignment: TaskAssignment = {
        taskId,
        providerId,
        modelId,
        enableRewrite: false,
        enableStreaming,
        temperature: metadata.defaultTemperature,
        maxTokens: metadata.defaultMaxTokens,
        topP: 0.95,
        updatedAt: Date.now(),
      };

      await db.put("taskAssignments", assignment);
    }
  }
}

export const taskAssignmentService = new TaskAssignmentService();
