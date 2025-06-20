import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { characterAnalysisService } from "./services/character-analysis";
import { animationGeneratorService } from "./services/animation-generator";
import { videoProcessorService } from "./services/video-processor";
import { insertCharacterSchema, insertAnimationSchema, insertGameVideoSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Character management routes
  app.post("/api/characters", upload.single('image'), async (req, res) => {
    try {
      const { name, userId } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // Create character record
      const character = await storage.createCharacter({
        name,
        userId: parseInt(userId),
        imageUrl: `/uploads/${req.file.filename}`,
        analysisData: null,
        skeletonData: null,
      });

      // Start analysis process
      const analysisResult = await characterAnalysisService.analyzeCharacter(req.file.path);
      
      // Update character with analysis results
      const updatedCharacter = await storage.updateCharacterAnalysis(
        character.id,
        analysisResult.analysis,
        analysisResult.skeleton
      );

      // Create character parts
      for (const part of analysisResult.parts) {
        await storage.createCharacterPart({
          characterId: character.id,
          name: part.name,
          confidence: part.confidence,
          boundingBox: part.boundingBox,
          layer: part.layer,
          joints: part.joints,
        });
      }

      res.json({ character: updatedCharacter });
    } catch (error) {
      console.error("Error creating character:", error);
      res.status(500).json({ message: "Failed to create character" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const character = await storage.getCharacter(parseInt(req.params.id));
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  app.get("/api/characters/:id/parts", async (req, res) => {
    try {
      const parts = await storage.getCharacterParts(parseInt(req.params.id));
      res.json(parts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character parts" });
    }
  });

  // Animation generation routes
  app.post("/api/characters/:id/animations", async (req, res) => {
    try {
      const characterId = parseInt(req.params.id);
      const { type, properties } = req.body;

      const character = await storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const parts = await storage.getCharacterParts(characterId);
      
      const animationData = await animationGeneratorService.generateAnimation(
        character,
        parts,
        type,
        properties
      );

      const animation = await storage.createAnimation({
        characterId,
        name: `${type}_animation_${Date.now()}`,
        type,
        keyframes: animationData.keyframes,
        duration: animationData.duration,
        fps: properties.fps || 30,
        properties,
      });

      res.json(animation);
    } catch (error) {
      console.error("Error generating animation:", error);
      res.status(500).json({ message: "Failed to generate animation" });
    }
  });

  app.get("/api/characters/:id/animations", async (req, res) => {
    try {
      const animations = await storage.getAnimations(parseInt(req.params.id));
      res.json(animations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch animations" });
    }
  });

  // Game video processing routes
  app.post("/api/game-videos", upload.single('video'), async (req, res) => {
    try {
      const { name, userId } = req.body;
      if (!req.file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const gameVideo = await storage.createGameVideo({
        name,
        userId: parseInt(userId),
        videoUrl: `/uploads/${req.file.filename}`,
        processingStatus: "processing",
      });

      // Start video processing in background
      videoProcessorService.processGameVideo(gameVideo.id, req.file.path)
        .then(async (extractedAnimations) => {
          await storage.updateGameVideoStatus(
            gameVideo.id,
            "completed",
            extractedAnimations
          );
        })
        .catch(async (error) => {
          console.error("Video processing failed:", error);
          await storage.updateGameVideoStatus(gameVideo.id, "failed");
        });

      res.json(gameVideo);
    } catch (error) {
      console.error("Error uploading game video:", error);
      res.status(500).json({ message: "Failed to upload game video" });
    }
  });

  app.get("/api/game-videos/:id", async (req, res) => {
    try {
      const videos = await storage.getGameVideos(parseInt(req.params.id));
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game videos" });
    }
  });

  // Animation preview and export routes
  app.get("/api/animations/:id/preview", async (req, res) => {
    try {
      const animation = await storage.getAnimation(parseInt(req.params.id));
      if (!animation) {
        return res.status(404).json({ message: "Animation not found" });
      }

      const previewData = await animationGeneratorService.generatePreview(animation);
      res.json(previewData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate animation preview" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
