import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').unique().notNull(),
  totalXP: integer('total_xp').default(0),
  level: integer('level').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const placementResults = pgTable('placement_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  scores: jsonb('scores'),
  skillLevels: jsonb('skill_levels'),
  totalScore: integer('total_score').default(0),
  maxScore: integer('max_score').default(0),
  completedAt: timestamp('completed_at').defaultNow()
});

export const learningProgress = pgTable('learning_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  currentTopic: text('current_topic'),
  currentLevel: text('current_level'),
  completedLessons: integer('completed_lessons').default(0),
  totalLessons: integer('total_lessons').default(0),
  learningPath: jsonb('learning_path'),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const quizStats = pgTable('quiz_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  mode: text('mode').notNull(), // classic, survival, time-attack, accuracy
  difficulty: text('difficulty'), // easy, medium, hard
  topic: text('topic'),
  score: integer('score').default(0),
  totalQuestions: integer('total_questions').default(0),
  correctAnswers: integer('correct_answers').default(0),
  timeSpent: integer('time_spent').default(0), // in milliseconds
  completedAt: timestamp('completed_at').defaultNow()
});

export const topicStats = pgTable('topic_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  topic: text('topic').notNull(),
  totalQuestions: integer('total_questions').default(0),
  correctAnswers: integer('correct_answers').default(0),
  averageTime: integer('average_time').default(0),
  bestStreak: integer('best_streak').default(0),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  placementResults: many(placementResults),
  learningProgress: many(learningProgress),
  quizStats: many(quizStats),
  topicStats: many(topicStats)
}));

export const placementResultsRelations = relations(placementResults, ({ one }) => ({
  user: one(users, {
    fields: [placementResults.userId],
    references: [users.id]
  })
}));

export const learningProgressRelations = relations(learningProgress, ({ one }) => ({
  user: one(users, {
    fields: [learningProgress.userId],
    references: [users.id]
  })
}));

export const quizStatsRelations = relations(quizStats, ({ one }) => ({
  user: one(users, {
    fields: [quizStats.userId],
    references: [users.id]
  })
}));

export const topicStatsRelations = relations(topicStats, ({ one }) => ({
  user: one(users, {
    fields: [topicStats.userId],
    references: [users.id]
  })
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PlacementResult = typeof placementResults.$inferSelect;
export type InsertPlacementResult = typeof placementResults.$inferInsert;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = typeof learningProgress.$inferInsert;
export type QuizStat = typeof quizStats.$inferSelect;
export type InsertQuizStat = typeof quizStats.$inferInsert;
export type TopicStat = typeof topicStats.$inferSelect;
export type InsertTopicStat = typeof topicStats.$inferInsert;
