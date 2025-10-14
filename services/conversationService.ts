import { openDB, type IDBPDatabase } from "idb";
import type {
  Conversation,
  ConversationTurn,
} from "../types/conversation";
import type { TaskId } from "../types/providers";

const DB_NAME = "the-transformation-engine";
const DB_VERSION = 8;

export class ConversationService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION);
  }

  // Create new conversation
  async createConversation(
    taskId: TaskId,
    title?: string
  ): Promise<Conversation> {
    const db = await this.dbPromise;
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
  async getConversation(id: string): Promise<Conversation | null> {
    const db = await this.dbPromise;
    return (await db.get("conversations", id)) || null;
  }

  // Get conversation with all turns populated
  async getConversationWithTurns(id: string): Promise<Conversation | null> {
    const db = await this.dbPromise;
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
  async addTurn(
    conversationId: string,
    turn: Omit<ConversationTurn, "id" | "turnNumber" | "timestamp">
  ): Promise<ConversationTurn> {
    const db = await this.dbPromise;
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
  async getTurn(turnId: string): Promise<ConversationTurn | null> {
    const db = await this.dbPromise;
    return (await db.get("conversationTurns", turnId)) || null;
  }

  // Update turn (for user edits)
  async updateTurn(
    turnId: string,
    updates: Partial<ConversationTurn>
  ): Promise<void> {
    const db = await this.dbPromise;
    const turn = await db.get("conversationTurns", turnId);

    if (!turn) {
      throw new Error(`Turn ${turnId} not found`);
    }

    const updated = { ...turn, ...updates };
    await db.put("conversationTurns", updated);
  }

  // Delete conversation and all its turns
  async deleteConversation(id: string): Promise<void> {
    const db = await this.dbPromise;
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
  async getConversationsForTask(taskId: TaskId): Promise<Conversation[]> {
    const db = await this.dbPromise;
    const all = await db.getAll("conversations");
    return all.filter((c) => c.taskId === taskId);
  }

  // Get recent conversations (across all tasks)
  async getRecentConversations(limit: number = 10): Promise<Conversation[]> {
    const db = await this.dbPromise;
    const all = await db.getAll("conversations");

    // Sort by updatedAt descending
    all.sort((a, b) => b.updatedAt - a.updatedAt);

    return all.slice(0, limit);
  }

  // Update conversation title
  async updateConversationTitle(id: string, title: string): Promise<void> {
    const db = await this.dbPromise;
    const conversation = await db.get("conversations", id);

    if (!conversation) {
      throw new Error(`Conversation ${id} not found`);
    }

    conversation.title = title;
    conversation.updatedAt = Date.now();
    await db.put("conversations", conversation);
  }

  // Link conversation to prompt
  async linkToPrompt(conversationId: string, promptId: string): Promise<void> {
    const db = await this.dbPromise;
    const conversation = await db.get("conversations", conversationId);

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.promptId = promptId;
    conversation.updatedAt = Date.now();
    await db.put("conversations", conversation);
  }

  // Get conversation linked to prompt
  async getConversationForPrompt(
    promptId: string
  ): Promise<Conversation | null> {
    const db = await this.dbPromise;
    const all = await db.getAll("conversations");
    return all.find((c) => c.promptId === promptId) || null;
  }

  // Get turns for a conversation (ordered)
  async getTurnsForConversation(
    conversationId: string
  ): Promise<ConversationTurn[]> {
    const db = await this.dbPromise;
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
