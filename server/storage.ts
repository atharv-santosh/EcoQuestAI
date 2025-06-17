import { users, hunts, achievements, type User, type InsertUser, type Hunt, type InsertHunt, type Achievement, type InsertAchievement } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<User | undefined>;
  updateUserLocation(userId: number, location: { lat: number; lng: number; address?: string }): Promise<User | undefined>;

  // Hunt methods
  createHunt(hunt: InsertHunt): Promise<Hunt>;
  getHunt(id: number): Promise<Hunt | undefined>;
  getUserHunts(userId: number): Promise<Hunt[]>;
  updateHunt(id: number, updates: Partial<Hunt>): Promise<Hunt | undefined>;
  getActiveHunt(userId: number): Promise<Hunt | undefined>;

  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: number): Promise<Achievement[]>;
  checkAndAwardAchievements(userId: number, huntData: Hunt): Promise<Achievement[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hunts: Map<number, Hunt>;
  private achievements: Map<number, Achievement>;
  private currentUserId: number;
  private currentHuntId: number;
  private currentAchievementId: number;

  constructor() {
    this.users = new Map();
    this.hunts = new Map();
    this.achievements = new Map();
    this.currentUserId = 1;
    this.currentHuntId = 1;
    this.currentAchievementId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, points: 0, location: null };
    this.users.set(id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, points: (user.points || 0) + points };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserLocation(userId: number, location: { lat: number; lng: number; address?: string }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, location };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createHunt(insertHunt: InsertHunt): Promise<Hunt> {
    const id = this.currentHuntId++;
    const now = new Date();
    const hunt: Hunt = { 
      ...insertHunt, 
      id, 
      createdAt: now,
      completedStops: 0 
    };
    this.hunts.set(id, hunt);
    return hunt;
  }

  async getHunt(id: number): Promise<Hunt | undefined> {
    return this.hunts.get(id);
  }

  async getUserHunts(userId: number): Promise<Hunt[]> {
    return Array.from(this.hunts.values()).filter(hunt => hunt.userId === userId);
  }

  async updateHunt(id: number, updates: Partial<Hunt>): Promise<Hunt | undefined> {
    const hunt = this.hunts.get(id);
    if (!hunt) return undefined;
    
    const updatedHunt = { ...hunt, ...updates };
    this.hunts.set(id, updatedHunt);
    return updatedHunt;
  }

  async getActiveHunt(userId: number): Promise<Hunt | undefined> {
    return Array.from(this.hunts.values()).find(
      hunt => hunt.userId === userId && hunt.status === 'active'
    );
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const now = new Date();
    const achievement: Achievement = { ...insertAchievement, id, earnedAt: now };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values()).filter(
      achievement => achievement.userId === userId
    );
  }

  async checkAndAwardAchievements(userId: number, huntData: Hunt): Promise<Achievement[]> {
    const userAchievements = await this.getUserAchievements(userId);
    const existingTypes = new Set(userAchievements.map(a => a.type));
    const newAchievements: Achievement[] = [];
    
    // Check for nature photographer achievement
    if (!existingTypes.has('nature-photographer') && huntData.theme === 'pollinator-hunt' && huntData.completedStops >= 3) {
      const achievement = await this.createAchievement({
        userId,
        type: 'nature-photographer',
        title: 'Nature Photographer',
        description: 'Captured 10 different plant species'
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
    if (!existingTypes.has('eco-scholar') && huntData.completedStops >= 5) {
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

export const storage = new MemStorage();
