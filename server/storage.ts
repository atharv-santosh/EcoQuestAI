import {
  users,
  hunts,
  achievements,
  type User,
  type UpsertUser,
  type Hunt,
  type InsertHunt,
  type Achievement,
  type InsertAchievement
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods (updated for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  updateUserLocation(userId: string, location: { lat: number; lng: number; address?: string }): Promise<User | undefined>;

  // Hunt methods
  createHunt(hunt: InsertHunt): Promise<Hunt>;
  getHunt(id: number): Promise<Hunt | undefined>;
  getUserHunts(userId: string): Promise<Hunt[]>;
  updateHunt(id: number, updates: Partial<Hunt>): Promise<Hunt | undefined>;
  getActiveHunt(userId: string): Promise<Hunt | undefined>;

  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  checkAndAwardAchievements(userId: string, huntData: Hunt): Promise<Achievement[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const [updatedUser] = await db
      .update(users)
      .set({ 
        points: (user.points || 0) + points,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser || undefined;
  }

  async updateUserLocation(userId: string, location: { lat: number; lng: number; address?: string }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        location,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser || undefined;
  }

  // Hunt methods
  async createHunt(insertHunt: InsertHunt): Promise<Hunt> {
    const [hunt] = await db
      .insert(hunts)
      .values([insertHunt])
      .returning();
    return hunt;
  }

  async getHunt(id: number): Promise<Hunt | undefined> {
    const [hunt] = await db.select().from(hunts).where(eq(hunts.id, id));
    return hunt || undefined;
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    return await db.select().from(hunts).where(eq(hunts.userId, userId));
  }

  async updateHunt(id: number, updates: Partial<Hunt>): Promise<Hunt | undefined> {
    const [updatedHunt] = await db
      .update(hunts)
      .set(updates)
      .where(eq(hunts.id, id))
      .returning();
    
    return updatedHunt || undefined;
  }

  async getActiveHunt(userId: string): Promise<Hunt | undefined> {
    const [hunt] = await db
      .select()
      .from(hunts)
      .where(eq(hunts.userId, userId) && eq(hunts.status, 'active'));
    
    return hunt || undefined;
  }

  // Achievement methods
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }

  async checkAndAwardAchievements(userId: string, huntData: Hunt): Promise<Achievement[]> {
    const userAchievements = await this.getUserAchievements(userId);
    const existingTypes = new Set(userAchievements.map(a => a.type));
    const newAchievements: Achievement[] = [];
    
    // Check for nature photographer achievement
    if (!existingTypes.has('nature-photographer') && huntData.theme === 'pollinator-hunt' && (huntData.completedStops || 0) >= 3) {
      const achievement = await this.createAchievement({
        userId,
        type: 'nature-photographer',
        title: 'Nature Photographer',
        description: 'Captured 3 different plant species'
      });
      newAchievements.push(achievement);
    }
    
    // Check for urban explorer achievement
    if (!existingTypes.has('urban-explorer') && huntData.theme === 'urban-nature' && huntData.status === 'completed') {
      const achievement = await this.createAchievement({
        userId,
        type: 'urban-explorer',
        title: 'Urban Explorer',
        description: 'Completed first quest in downtown area'
      });
      newAchievements.push(achievement);
    }
    
    // Check for eco scholar achievement
    if (!existingTypes.has('eco-scholar') && (huntData.completedStops || 0) >= 5) {
      const achievement = await this.createAchievement({
        userId,
        type: 'eco-scholar',
        title: 'Eco Scholar',
        description: 'Answered sustainability questions correctly'
      });
      newAchievements.push(achievement);
    }
    
    return newAchievements;
  }
}

export const storage = new DatabaseStorage();
