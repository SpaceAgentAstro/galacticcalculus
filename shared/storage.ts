import { users, placementResults, learningProgress, quizStats, topicStats, type User, type InsertUser, type PlacementResult, type InsertPlacementResult, type LearningProgress, type InsertLearningProgress, type QuizStat, type InsertQuizStat, type TopicStat, type InsertTopicStat } from "../shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Placement test methods
  savePlacementResult(data: InsertPlacementResult): Promise<PlacementResult>;
  getPlacementResult(userId: number): Promise<PlacementResult | undefined>;

  // Learning progress methods
  saveLearningProgress(data: InsertLearningProgress): Promise<LearningProgress>;
  getLearningProgress(userId: number): Promise<LearningProgress | undefined>;
  updateLearningProgress(userId: number, data: Partial<LearningProgress>): Promise<LearningProgress | undefined>;

  // Quiz stats methods
  saveQuizStats(data: InsertQuizStat): Promise<QuizStat>;
  getQuizStats(userId: number): Promise<QuizStat[]>;
  getQuizStatsByMode(userId: number, mode: string): Promise<QuizStat[]>;

  // Topic stats methods
  saveTopicStats(data: InsertTopicStat): Promise<TopicStat>;
  getTopicStats(userId: number): Promise<TopicStat[]>;
  getTopicStatsByTopic(userId: number, topic: string): Promise<TopicStat | undefined>;
  updateTopicStats(userId: number, topic: string, data: Partial<TopicStat>): Promise<TopicStat | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Placement test methods
  async savePlacementResult(data: InsertPlacementResult): Promise<PlacementResult> {
    const [result] = await db
      .insert(placementResults)
      .values(data)
      .returning();
    return result;
  }

  async getPlacementResult(userId: number): Promise<PlacementResult | undefined> {
    const [result] = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.userId, userId))
      .orderBy(desc(placementResults.completedAt))
      .limit(1);
    return result || undefined;
  }

  // Learning progress methods
  async saveLearningProgress(data: InsertLearningProgress): Promise<LearningProgress> {
    const [progress] = await db
      .insert(learningProgress)
      .values(data)
      .returning();
    return progress;
  }

  async getLearningProgress(userId: number): Promise<LearningProgress | undefined> {
    const [progress] = await db
      .select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId))
      .orderBy(desc(learningProgress.updatedAt))
      .limit(1);
    return progress || undefined;
  }

  async updateLearningProgress(userId: number, data: Partial<LearningProgress>): Promise<LearningProgress | undefined> {
    const [progress] = await db
      .update(learningProgress)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(learningProgress.userId, userId))
      .returning();
    return progress || undefined;
  }

  // Quiz stats methods
  async saveQuizStats(data: InsertQuizStat): Promise<QuizStat> {
    const [stats] = await db
      .insert(quizStats)
      .values(data)
      .returning();
    return stats;
  }

  async getQuizStats(userId: number): Promise<QuizStat[]> {
    return await db
      .select()
      .from(quizStats)
      .where(eq(quizStats.userId, userId))
      .orderBy(desc(quizStats.completedAt));
  }

  async getQuizStatsByMode(userId: number, mode: string): Promise<QuizStat[]> {
    return await db
      .select()
      .from(quizStats)
      .where(and(eq(quizStats.userId, userId), eq(quizStats.mode, mode)))
      .orderBy(desc(quizStats.completedAt));
  }

  // Topic stats methods
  async saveTopicStats(data: InsertTopicStat): Promise<TopicStat> {
    const [stats] = await db
      .insert(topicStats)
      .values(data)
      .returning();
    return stats;
  }

  async getTopicStats(userId: number): Promise<TopicStat[]> {
    return await db
      .select()
      .from(topicStats)
      .where(eq(topicStats.userId, userId))
      .orderBy(desc(topicStats.updatedAt));
  }

  async getTopicStatsByTopic(userId: number, topic: string): Promise<TopicStat | undefined> {
    const [stats] = await db
      .select()
      .from(topicStats)
      .where(and(eq(topicStats.userId, userId), eq(topicStats.topic, topic)))
      .limit(1);
    return stats || undefined;
  }

  async updateTopicStats(userId: number, topic: string, data: Partial<TopicStat>): Promise<TopicStat | undefined> {
    const [stats] = await db
      .update(topicStats)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(topicStats.userId, userId), eq(topicStats.topic, topic)))
      .returning();
    return stats || undefined;
  }
}

export const storage = new DatabaseStorage();
