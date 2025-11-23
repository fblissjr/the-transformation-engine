import type { IDBPDatabase } from "idb";
import type { TaskAssignment, TaskId } from "../types/providers";
import { TASK_METADATA } from "../types/providers";
import { getDB } from "./db/indexedDbService";

/**
 * TaskAssignmentService class
 *
 * Manages task-specific model assignments.
 * Allows assigning different AI models and settings to different tasks.
 * Supports global defaults and per-task overrides.
 */
export class TaskAssignmentService {
  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Get task assignment for a specific task
  /**
   * Retrieves the assignment for a specific task.
   *
   * @param taskId - The ID of the task.
   * @returns The TaskAssignment object or null if not found.
   */
  async getTaskAssignment(taskId: TaskId): Promise<TaskAssignment | null> {
    const db = await this.getDb();
    const assignment = await db.get("taskAssignments", taskId);
    return assignment || null;
  }

  // Set/update task assignment
  /**
   * Sets or updates the assignment for a task.
   *
   * @param assignment - The TaskAssignment object to save.
   */
  async setTaskAssignment(assignment: TaskAssignment): Promise<void> {
    const db = await this.getDb();
    assignment.updatedAt = Date.now();
    await db.put("taskAssignments", assignment);
  }

  // Get all task assignments
  /**
   * Retrieves all task assignments.
   *
   * @returns An array of all TaskAssignment objects.
   */
  async getAllTaskAssignments(): Promise<TaskAssignment[]> {
    const db = await this.getDb();
    return db.getAll("taskAssignments");
  }

  // Create default task assignment for a task
  /**
   * Creates a default assignment for a task using a specific provider and model.
   * Uses default temperature and max tokens from task metadata.
   *
   * @param taskId - The ID of the task.
   * @param providerId - The ID of the provider.
   * @param modelId - The ID of the model.
   * @returns The created TaskAssignment object.
   */
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
  /**
   * Retrieves the global default provider and model settings.
   *
   * @returns An object with providerId and modelId, or null if not set.
   */
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
  /**
   * Sets the global default provider and model.
   *
   * @param providerId - The ID of the provider.
   * @param modelId - The ID of the model.
   */
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
  /**
   * Retrieves an existing assignment for a task, or creates one using the global default if it doesn't exist.
   *
   * @param taskId - The ID of the task.
   * @returns The TaskAssignment object.
   * @throws Error if no assignment or global default exists.
   */
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
  /**
   * Resets a task's assignment to use the global default provider and model.
   *
   * @param taskId - The ID of the task.
   * @throws Error if no global default is configured.
   */
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
  /**
   * Copies the assignment settings from one task to another.
   *
   * @param fromTaskId - The source task ID.
   * @param toTaskId - The destination task ID.
   * @throws Error if the source task has no assignment.
   */
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
  /**
   * Applies the same provider, model, and streaming settings to all available tasks.
   * Uses default temperature and max tokens for each task type.
   *
   * @param providerId - The ID of the provider.
   * @param modelId - The ID of the model.
   * @param enableStreaming - (Optional) Whether to enable streaming. Defaults to false.
   */
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
