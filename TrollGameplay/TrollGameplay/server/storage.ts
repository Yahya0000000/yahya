import { 
  users, 
  characters, 
  characterParts, 
  animations, 
  gameVideos,
  type User, 
  type InsertUser,
  type Character,
  type InsertCharacter,
  type CharacterPart,
  type InsertCharacterPart,
  type Animation,
  type InsertAnimation,
  type GameVideo,
  type InsertGameVideo
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Character operations
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharacter(id: number): Promise<Character | undefined>;
  getCharactersByUser(userId: number): Promise<Character[]>;
  updateCharacterAnalysis(id: number, analysisData: any, skeletonData: any): Promise<Character>;

  // Character parts operations
  createCharacterPart(part: InsertCharacterPart): Promise<CharacterPart>;
  getCharacterParts(characterId: number): Promise<CharacterPart[]>;
  updateCharacterPart(id: number, updates: Partial<CharacterPart>): Promise<CharacterPart>;

  // Animation operations
  createAnimation(animation: InsertAnimation): Promise<Animation>;
  getAnimations(characterId: number): Promise<Animation[]>;
  getAnimation(id: number): Promise<Animation | undefined>;

  // Game video operations
  createGameVideo(video: InsertGameVideo): Promise<GameVideo>;
  getGameVideos(userId: number): Promise<GameVideo[]>;
  updateGameVideoStatus(id: number, status: string, extractedAnimations?: any): Promise<GameVideo>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private characterParts: Map<number, CharacterPart[]>;
  private animations: Map<number, Animation[]>;
  private gameVideos: Map<number, GameVideo[]>;
  private currentUserId: number;
  private currentCharacterId: number;
  private currentPartId: number;
  private currentAnimationId: number;
  private currentVideoId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.characterParts = new Map();
    this.animations = new Map();
    this.gameVideos = new Map();
    this.currentUserId = 1;
    this.currentCharacterId = 1;
    this.currentPartId = 1;
    this.currentAnimationId = 1;
    this.currentVideoId = 1;
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
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentCharacterId++;
    const character: Character = {
      ...insertCharacter,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.characters.set(id, character);
    return character;
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async getCharactersByUser(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (character) => character.userId === userId
    );
  }

  async updateCharacterAnalysis(id: number, analysisData: any, skeletonData: any): Promise<Character> {
    const character = this.characters.get(id);
    if (!character) {
      throw new Error("Character not found");
    }
    
    const updated: Character = {
      ...character,
      analysisData,
      skeletonData,
      updatedAt: new Date(),
    };
    this.characters.set(id, updated);
    return updated;
  }

  async createCharacterPart(insertPart: InsertCharacterPart): Promise<CharacterPart> {
    const id = this.currentPartId++;
    const part: CharacterPart = { ...insertPart, id };
    
    const existingParts = this.characterParts.get(insertPart.characterId) || [];
    this.characterParts.set(insertPart.characterId, [...existingParts, part]);
    
    return part;
  }

  async getCharacterParts(characterId: number): Promise<CharacterPart[]> {
    return this.characterParts.get(characterId) || [];
  }

  async updateCharacterPart(id: number, updates: Partial<CharacterPart>): Promise<CharacterPart> {
    for (const [characterId, parts] of this.characterParts.entries()) {
      const partIndex = parts.findIndex(p => p.id === id);
      if (partIndex !== -1) {
        const updated = { ...parts[partIndex], ...updates };
        parts[partIndex] = updated;
        this.characterParts.set(characterId, parts);
        return updated;
      }
    }
    throw new Error("Character part not found");
  }

  async createAnimation(insertAnimation: InsertAnimation): Promise<Animation> {
    const id = this.currentAnimationId++;
    const animation: Animation = {
      ...insertAnimation,
      id,
      createdAt: new Date(),
    };
    
    const existingAnimations = this.animations.get(insertAnimation.characterId) || [];
    this.animations.set(insertAnimation.characterId, [...existingAnimations, animation]);
    
    return animation;
  }

  async getAnimations(characterId: number): Promise<Animation[]> {
    return this.animations.get(characterId) || [];
  }

  async getAnimation(id: number): Promise<Animation | undefined> {
    for (const animations of this.animations.values()) {
      const animation = animations.find(a => a.id === id);
      if (animation) return animation;
    }
    return undefined;
  }

  async createGameVideo(insertVideo: InsertGameVideo): Promise<GameVideo> {
    const id = this.currentVideoId++;
    const video: GameVideo = {
      ...insertVideo,
      id,
      createdAt: new Date(),
    };
    
    const existingVideos = this.gameVideos.get(insertVideo.userId) || [];
    this.gameVideos.set(insertVideo.userId, [...existingVideos, video]);
    
    return video;
  }

  async getGameVideos(userId: number): Promise<GameVideo[]> {
    return this.gameVideos.get(userId) || [];
  }

  async updateGameVideoStatus(id: number, status: string, extractedAnimations?: any): Promise<GameVideo> {
    for (const [userId, videos] of this.gameVideos.entries()) {
      const videoIndex = videos.findIndex(v => v.id === id);
      if (videoIndex !== -1) {
        const updated = { 
          ...videos[videoIndex], 
          processingStatus: status,
          ...(extractedAnimations && { extractedAnimations })
        };
        videos[videoIndex] = updated;
        this.gameVideos.set(userId, videos);
        return updated;
      }
    }
    throw new Error("Game video not found");
  }
}

export const storage = new MemStorage();
