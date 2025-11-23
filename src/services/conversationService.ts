import type { IDBPDatabase } from "idb";
import type {
  Conversation,
  ConversationTurn,
} from "../types/conversation";
import type { TaskId } from "../types/providers";
import { getDB } from "./db/indexedDbService";

/**
 * ConversationService class
 *
 * Manages the lifecycle of conversations, including creation, retrieval,
 * updating, and deletion of conversations and their turns.
 * Stores data in IndexedDB.
 */
export class ConversationService {
  private async getDb(): Promise<IDBPDatabase> {
    return getDB();
  }

  // Create new conversation
  /**
   * Creates a new conversation.
   *
   * @param taskId - The ID of the task associated with this conversation.
   * @param title - (Optional) The title of the conversation.
   * @returns The newly created Conversation object.
   */
  async createConversation(
    taskId: TaskId,
    title?: string
  ): Promise<Conversation> {
    const db = await this.getDb();
    const conversation: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      taskId,
      title: title || `${taskId} - ${new Date().toLocaleString()}`,
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalTokens: 0,
    };

    await db.put("conversations", conversation);
    return conversation;
  }

  // Get conversation by ID
  /**
   * Retrieves a conversation by its ID.
   *
   * @param id - The ID of the conversation.
   * @returns The Conversation object or null if not found.
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const db = await this.getDb();
    return (await db.get("conversations", id)) || null;
  }

  // Get conversation with all turns populated
  /**
   * Retrieves a conversation with all its turns fully populated.
   *
   * @param id - The ID of the conversation.
   * @returns The Conversation object with turns, or null if not found.
   */
  async getConversationWithTurns(id: string): Promise<Conversation | null> {
    const db = await this.getDb();
    const conversation = await db.get("conversations", id);
    if (!conversation) return null;

    const turns = await db.getAllFromIndex(
      "conversationTurns",
      "conversationId",
      id
    );

    // Sort by turn number
    turns.sort((a, b) => a.turnNumber - b.turnNumber);

    return {
      ...conversation,
      turns,
    };
  }

  // Add turn to conversation
  /**
   * Adds a new turn to an existing conversation.
   *
   * @param conversationId - The ID of the conversation.
   * @param turn - The turn data (excluding ID, turn number, and timestamp).
   * @returns The newly created ConversationTurn object.
   * @throws Error if the conversation is not found.
   */
  async addTurn(
    conversationId: string,
    turn: Omit<ConversationTurn, "id" | "turnNumber" | "timestamp">
  ): Promise<ConversationTurn> {
    const db = await this.getDb();
    const conversation = await this.getConversationWithTurns(conversationId);

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const turnNumber = conversation.turns.length + 1;

    const newTurn: ConversationTurn = {
      ...turn,
      id: `turn_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      turnNumber,
      timestamp: Date.now(),
    };

    await db.put("conversationTurns", newTurn);

    // Update conversation metadata
    conversation.totalTokens += turn.usage.totalTokens;
    conversation.updatedAt = Date.now();
    await db.put("conversations", conversation);

    return newTurn;
  }

  // Get turn by ID
  /**
   * Retrieves a specific turn by its ID.
   *
   * @param turnId - The ID of the turn.
   * @returns The ConversationTurn object or null if not found.
   */
  async getTurn(turnId: string): Promise<ConversationTurn | null> {
    const db = await this.getDb();
    return (await db.get("conversationTurns", turnId)) || null;
  }

  // Update turn (for user edits)
  /**
   * Updates an existing turn.
   *
   * @param turnId - The ID of the turn to update.
   * @param updates - The partial updates to apply.
   * @throws Error if the turn is not found.
   */
  async updateTurn(
    turnId: string,
    updates: Partial<ConversationTurn>
  ): Promise<void> {
    const db = await this.getDb();
    const turn = await db.get("conversationTurns", turnId);

    if (!turn) {
      throw new Error(`Turn ${turnId} not found`);
    }

    const updated = { ...turn, ...updates };
    await db.put("conversationTurns", updated);
  }

  // Delete conversation and all its turns
  /**
   * Deletes a conversation and all its associated turns.
   *
   * @param id - The ID of the conversation to delete.
   */
  async deleteConversation(id: string): Promise<void> {
    const db = await this.getDb();
    const turns = await db.getAllFromIndex(
      "conversationTurns",
      "conversationId",
      id
    );

    // Delete all turns
    for (const turn of turns) {
      await db.delete("conversationTurns", turn.id);
    }

    // Delete conversation
    await db.delete("conversations", id);
  }

  // Get all conversations for a task
  /**
   * Retrieves all conversations associated with a specific task.
   *
   * @param taskId - The ID of the task.
   * @returns An array of Conversation objects.
   */
  async getConversationsForTask(taskId: TaskId): Promise<Conversation[]> {
    const db = await this.getDb();
    const all = await db.getAll("conversations");
    return all.filter((c) => c.taskId === taskId);
  }

  // Get recent conversations (across all tasks)
  /**
   * Retrieves the most recent conversations across all tasks.
   *
   * @param limit - (Optional) The maximum number of conversations to return. Defaults to 10.
   * @returns An array of recent Conversation objects.
   */
  async getRecentConversations(limit: number = 10): Promise<Conversation[]> {
    const db = await this.getDb();
    const all = await db.getAll("conversations");

    // Sort by updatedAt descending
    all.sort((a, b) => b.updatedAt - a.updatedAt);

    return all.slice(0, limit);
  }

  // Update conversation title
  /**
   * Updates the title of a conversation.
   *
   * @param id - The ID of the conversation.
   * @param title - The new title.
   * @throws Error if the conversation is not found.
   */
  async updateConversationTitle(id: string, title: string): Promise<void> {
    const db = await this.getDb();
    const conversation = await db.get("conversations", id);

    if (!conversation) {
      throw new Error(`Conversation ${id} not found`);
    }

    conversation.title = title;
    conversation.updatedAt = Date.now();
    await db.put("conversations", conversation);
  }

  // Link conversation to prompt
  /**
   * Links a conversation to a specific prompt ID.
   *
   * @param conversationId - The ID of the conversation.
   * @param promptId - The ID of the prompt.
   * @throws Error if the conversation is not found.
   */
  async linkToPrompt(conversationId: string, promptId: string): Promise<void> {
    const db = await this.getDb();
    const conversation = await db.get("conversations", conversationId);

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.promptId = promptId;
    conversation.updatedAt = Date.now();
    await db.put("conversations", conversation);
  }

  // Get conversation linked to prompt
  /**
   * Retrieves the conversation linked to a specific prompt ID.
   *
   * @param promptId - The ID of the prompt.
   * @returns The linked Conversation object or null if not found.
   */
  async getConversationForPrompt(
    promptId: string
  ): Promise<Conversation | null> {
    const db = await this.getDb();
    const all = await db.getAll("conversations");
    return all.find((c) => c.promptId === promptId) || null;
  }

  // Get turns for a conversation (ordered)
  /**
   * Retrieves all turns for a specific conversation, ordered by turn number.
   *
   * @param conversationId - The ID of the conversation.
   * @returns An array of ordered ConversationTurn objects.
   */
  async getTurnsForConversation(
    conversationId: string
  ): Promise<ConversationTurn[]> {
    const db = await this.getDb();
    const turns = await db.getAllFromIndex(
      "conversationTurns",
      "conversationId",
      conversationId
    );

    // Sort by turn number
    turns.sort((a, b) => a.turnNumber - b.turnNumber);

    return turns;
  }

  // Get refinement chain (turn and all its ancestors)
  /**
   * Retrieves the refinement chain for a specific turn, including the turn itself and all its ancestors.
   *
   * @param turnId - The ID of the turn.
   * @returns An array of ConversationTurn objects representing the chain.
   */
  async getRefinementChain(turnId: string): Promise<ConversationTurn[]> {
    const chain: ConversationTurn[] = [];
    let currentTurnId: string | undefined = turnId;

    while (currentTurnId) {
      const turn = await this.getTurn(currentTurnId);
      if (!turn) break;

      chain.unshift(turn); // Add to beginning (oldest first)
      currentTurnId = turn.parentTurnId;
    }

    return chain;
  }
}

export const conversationService = new ConversationService();
