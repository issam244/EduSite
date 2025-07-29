import { 
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type MathSolution, type InsertMathSolution,
  type AdminContent, type InsertAdminContent,
  users, conversations, messages, mathSolutions, adminContent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Math Solutions
  getMathSolution(messageId: string): Promise<MathSolution | undefined>;
  createMathSolution(solution: InsertMathSolution): Promise<MathSolution>;
  
  // Admin Content
  getAdminContent(id: string): Promise<AdminContent | undefined>;
  getAllAdminContent(type?: string): Promise<AdminContent[]>;
  createAdminContent(content: InsertAdminContent): Promise<AdminContent>;
  updateAdminContent(id: string, updates: Partial<AdminContent>): Promise<AdminContent | undefined>;
  deleteAdminContent(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation || undefined;
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Math Solutions
  async getMathSolution(messageId: string): Promise<MathSolution | undefined> {
    const [solution] = await db.select().from(mathSolutions).where(eq(mathSolutions.messageId, messageId));
    return solution || undefined;
  }

  async createMathSolution(insertSolution: InsertMathSolution): Promise<MathSolution> {
    const [solution] = await db
      .insert(mathSolutions)
      .values(insertSolution)
      .returning();
    return solution;
  }

  // Admin Content
  async getAdminContent(id: string): Promise<AdminContent | undefined> {
    const [content] = await db.select().from(adminContent).where(eq(adminContent.id, id));
    return content || undefined;
  }

  async getAllAdminContent(type?: string): Promise<AdminContent[]> {
    if (type) {
      return await db.select().from(adminContent)
        .where(eq(adminContent.type, type))
        .orderBy(desc(adminContent.createdAt));
    }
    return await db.select().from(adminContent).orderBy(desc(adminContent.createdAt));
  }

  async createAdminContent(insertContent: InsertAdminContent): Promise<AdminContent> {
    const [content] = await db
      .insert(adminContent)
      .values(insertContent)
      .returning();
    return content;
  }

  async updateAdminContent(id: string, updates: Partial<AdminContent>): Promise<AdminContent | undefined> {
    const [content] = await db
      .update(adminContent)
      .set(updates)
      .where(eq(adminContent.id, id))
      .returning();
    return content || undefined;
  }

  async deleteAdminContent(id: string): Promise<boolean> {
    const result = await db.delete(adminContent).where(eq(adminContent.id, id));
    return (result as any).rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
