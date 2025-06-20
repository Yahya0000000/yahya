import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  analysisData: jsonb("analysis_data"),
  skeletonData: jsonb("skeleton_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const characterParts = pgTable("character_parts", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  confidence: real("confidence").notNull(),
  boundingBox: jsonb("bounding_box").notNull(),
  layer: integer("layer").notNull(),
  joints: jsonb("joints"),
  isVisible: boolean("is_visible").default(true),
});

export const animations = pgTable("animations", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // walk, run, attack, etc.
  keyframes: jsonb("keyframes").notNull(),
  duration: real("duration").notNull(),
  fps: integer("fps").default(30),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameVideos = pgTable("game_videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  videoUrl: text("video_url").notNull(),
  extractedAnimations: jsonb("extracted_animations"),
  processingStatus: text("processing_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterPartSchema = createInsertSchema(characterParts).omit({
  id: true,
});

export const insertAnimationSchema = createInsertSchema(animations).omit({
  id: true,
  createdAt: true,
});

export const insertGameVideoSchema = createInsertSchema(gameVideos).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type CharacterPart = typeof characterParts.$inferSelect;
export type InsertCharacterPart = z.infer<typeof insertCharacterPartSchema>;
export type Animation = typeof animations.$inferSelect;
export type InsertAnimation = z.infer<typeof insertAnimationSchema>;
export type GameVideo = typeof gameVideos.$inferSelect;
export type InsertGameVideo = z.infer<typeof insertGameVideoSchema>;
