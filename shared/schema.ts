import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  points: integer("points").default(0),
  location: jsonb("location").$type<{ lat: number; lng: number; address?: string }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hunts = pgTable("hunts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  theme: text("theme").notNull(), // urban-nature, sustainable-shopping, pollinator-hunt, zero-waste-picnic
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: jsonb("location").$type<{ lat: number; lng: number; address: string }>().notNull(),
  stops: jsonb("stops").$type<Array<{
    id: string;
    title: string;
    description: string;
    location: { lat: number; lng: number };
    address: string;
    type: 'photo' | 'trivia' | 'task';
    challenge: {
      question?: string;
      options?: string[];
      correctAnswer?: string;
      photoPrompt?: string;
      taskDescription?: string;
    };
    completed: boolean;
    points: number;
  }>>().notNull(),
  status: text("status").notNull().default("active"), // active, completed, paused
  totalPoints: integer("total_points").default(0),
  completedStops: integer("completed_stops").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // nature-photographer, eco-scholar, urban-explorer
  title: text("title").notNull(),
  description: text("description").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertHuntSchema = createInsertSchema(hunts).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  earnedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertHunt = z.infer<typeof insertHuntSchema>;
export type Hunt = typeof hunts.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
