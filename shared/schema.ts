import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  schoolLevel: text("school_level").notNull(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  freeQuestionsUsed: integer("free_questions_used").default(0),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").default(sql`NOW()`),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").default(sql`NOW()`),
  updatedAt: timestamp("updated_at").default(sql`NOW()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'user' | 'assistant'
  inputMode: text("input_mode"), // 'text' | 'image' | 'pdf' | 'audio'
  language: text("language").default('fr'), // 'fr' | 'ar' | 'tn'
  metadata: jsonb("metadata"), // For storing processing info, confidence scores, etc.
  createdAt: timestamp("created_at").default(sql`NOW()`),
});

export const mathSolutions = pgTable("math_solutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => messages.id),
  steps: jsonb("steps").notNull(), // Array of solution steps
  confidence: integer("confidence"), // 0-100
  source: text("source").notNull(), // 'huggingface' | 'webscraping' | 'manual'
  createdAt: timestamp("created_at").default(sql`NOW()`),
});

export const adminContent = pgTable("admin_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'article' | 'solution_template' | 'category'
  title: text("title").notNull(),
  content: jsonb("content"),
  isPublished: boolean("is_published").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").default(sql`NOW()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMathSolutionSchema = createInsertSchema(mathSolutions).omit({
  id: true,
  createdAt: true,
});

export const insertAdminContentSchema = createInsertSchema(adminContent).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MathSolution = typeof mathSolutions.$inferSelect;
export type InsertMathSolution = z.infer<typeof insertMathSolutionSchema>;
export type AdminContent = typeof adminContent.$inferSelect;
export type InsertAdminContent = z.infer<typeof insertAdminContentSchema>;
