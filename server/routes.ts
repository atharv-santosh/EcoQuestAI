import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateEcoRoute, generateHint } from "./services/openai";
import { reverseGeocode } from "./services/maps";
import { insertHuntSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new eco hunt
  app.post("/api/hunts", async (req, res) => {
    try {
      const { theme, location, userId } = req.body;

      if (!theme || !location || !userId) {
        return res.status(400).json({ 
          message: "Theme, location, and userId are required" 
        });
      }

      // Get address if not provided
      let address = location.address;
      if (!address) {
        address = await reverseGeocode(location.lat, location.lng);
      }

      // Generate route using OpenAI
      const routeData = await generateEcoRoute({
        theme,
        location: { ...location, address }
      });

      // Create hunt in storage
      const huntData = {
        userId,
        theme,
        title: routeData.title,
        description: routeData.description,
        location: { ...location, address },
        stops: routeData.stops,
        status: "active" as const,
        totalPoints: routeData.totalPoints,
        completedStops: 0
      };

      const hunt = await storage.createHunt(huntData);
      
      // Update user location
      await storage.updateUserLocation(userId, location);

      res.json(hunt);
    } catch (error: any) {
      console.error("Error creating hunt:", error);
      res.status(500).json({ 
        message: error.message || "Failed to create hunt" 
      });
    }
  });

  // Get user's active hunt
  app.get("/api/hunts/active/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const hunt = await storage.getActiveHunt(userId);
      console.log(`[ACTIVE HUNT] Requested userId: ${userId}`);
      if (hunt) {
        console.log(`[ACTIVE HUNT] Returning hunt with id: ${hunt.id}, userId: ${hunt.userId}`);
      } else {
        console.log(`[ACTIVE HUNT] No active hunt found for userId: ${userId}`);
      }
      if (!hunt) {
        return res.status(404).json({ message: "No active hunt found" });
      }
      res.json(hunt);
    } catch (error) {
      console.error("Error fetching active hunt:", error);
      res.status(500).json({ message: "Failed to fetch active hunt" });
    }
  });

  // Get user's hunt history
  app.get("/api/hunts/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const hunts = await storage.getUserHunts(userId);
      res.json(hunts);
    } catch (error) {
      console.error("Error fetching user hunts:", error);
      res.status(500).json({ message: "Failed to fetch hunts" });
    }
  });

  // Complete a stop in a hunt
  app.post("/api/hunts/:huntId/stops/:stopId/complete", async (req, res) => {
    try {
      const huntId = parseInt(req.params.huntId);
      const stopId = req.params.stopId;
      const { answer, photoData } = req.body;

      const hunt = await storage.getHunt(huntId);
      if (!hunt) {
        return res.status(404).json({ message: "Hunt not found" });
      }

      // Find the stop and mark it as completed
      const updatedStops = hunt.stops.map(stop => {
        if (stop.id === stopId && !stop.completed) {
          return { ...stop, completed: true };
        }
        return stop;
      });

      const completedStops = updatedStops.filter(stop => stop.completed).length;
      const isHuntComplete = completedStops === updatedStops.length;
      
      const updatedHunt = await storage.updateHunt(huntId, {
        stops: updatedStops,
        completedStops,
        status: isHuntComplete ? "completed" : "active"
      });

      if (!updatedHunt) {
        return res.status(500).json({ message: "Failed to update hunt" });
      }

      // Award points to user
      const stop = updatedStops.find(s => s.id === stopId);
      if (stop) {
        await storage.updateUserPoints(hunt.userId, stop.points);
      }

      // Check for achievements
      const achievements = await storage.checkAndAwardAchievements(hunt.userId, updatedHunt);

      res.json({ 
        hunt: updatedHunt, 
        achievements,
        pointsEarned: stop?.points || 0
      });
    } catch (error) {
      console.error("Error completing stop:", error);
      res.status(500).json({ message: "Failed to complete stop" });
    }
  });

  // Get hint for a challenge
  app.post("/api/hunts/:huntId/stops/:stopId/hint", async (req, res) => {
    try {
      const huntId = parseInt(req.params.huntId);
      const stopId = req.params.stopId;

      const hunt = await storage.getHunt(huntId);
      if (!hunt) {
        return res.status(404).json({ message: "Hunt not found" });
      }

      const stop = hunt.stops.find(s => s.id === stopId);
      if (!stop) {
        return res.status(404).json({ message: "Stop not found" });
      }

      const hint = await generateHint(stop.challenge);
      res.json({ hint });
    } catch (error) {
      console.error("Error generating hint:", error);
      res.status(500).json({ 
        message: "Failed to generate hint",
        hint: "Keep exploring! Look around for clues related to nature and sustainability."
      });
    }
  });

  // Get user profile with achievements
  app.get("/api/users/:userId/profile", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const achievements = await storage.getUserAchievements(userId);
      const hunts = await storage.getUserHunts(userId);
      
      res.json({
        user,
        achievements,
        stats: {
          totalHunts: hunts.length,
          completedHunts: hunts.filter(h => h.status === 'completed').length,
          totalPoints: user.points || 0
        }
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Create a demo user for testing
  app.post("/api/users/demo", async (req, res) => {
    try {
      const randomStr = Math.random().toString(36).slice(2, 10);
      const newId = `demo_user_${Date.now()}_${randomStr}`;
      const existing = await storage.getUser(newId);
      if (existing) {
        console.log(`[DEMO USER] User with ID ${newId} already exists!`);
      } else {
        console.log(`[DEMO USER] Creating new demo user with ID: ${newId}`);
      }
      const demoUser = await storage.upsertUser({
        id: newId,
        email: `demo${Date.now()}@example.com`,
        firstName: "Demo",
        lastName: "User"
      });
      await storage.updateUserPoints(demoUser.id, 127);
      res.json(demoUser);
    } catch (error) {
      console.error("Error creating demo user:", error);
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });

  // Delete all hunts for a user (manual reset)
  app.delete('/api/hunts/reset/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const { db } = require('./db');
      const { hunts } = require('../shared/schema');
      await db.delete(hunts).where(hunts.userId.eq(userId));
      res.json({ message: `All hunts for user ${userId} deleted.` });
    } catch (error) {
      console.error('Error deleting hunts:', error);
      res.status(500).json({ message: 'Failed to delete hunts.' });
    }
  });

  // Get hunt by ID
  app.get("/api/hunts/:huntId", async (req, res) => {
    try {
      const huntId = parseInt(req.params.huntId);
      const hunt = await storage.getHunt(huntId);
      if (!hunt) {
        return res.status(404).json({ message: "Hunt not found" });
      }
      res.json(hunt);
    } catch (error) {
      console.error("Error fetching hunt by ID:", error);
      res.status(500).json({ message: "Failed to fetch hunt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
