import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface CharacterPart {
  name: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  layer: number;
  joints: Array<{
    x: number;
    y: number;
    type: string;
  }>;
}

export interface AnalysisResult {
  analysis: {
    characterType: string;
    bodyParts: string[];
    centerOfMass: { x: number; y: number };
    totalMass: number;
    complexity: string;
  };
  skeleton: {
    joints: Array<{
      id: string;
      position: { x: number; y: number };
      connections: string[];
      type: string;
    }>;
    bones: Array<{
      id: string;
      from: string;
      to: string;
      length: number;
    }>;
  };
  parts: CharacterPart[];
}

class CharacterAnalysisService {
  async analyzeCharacter(imagePath: string): Promise<AnalysisResult> {
    try {
      // This would integrate with actual computer vision APIs
      // For now, providing structured response that matches the interface requirements
      
      const mockAnalysis: AnalysisResult = {
        analysis: {
          characterType: "humanoid_creature",
          bodyParts: ["head", "torso", "right_arm", "left_arm", "right_leg", "left_leg", "weapon"],
          centerOfMass: { x: 48.2, y: 52.7 },
          totalMass: 85.4,
          complexity: "high"
        },
        skeleton: {
          joints: [
            { id: "head", position: { x: 48, y: 25 }, connections: ["neck"], type: "ball" },
            { id: "neck", position: { x: 48, y: 35 }, connections: ["head", "torso"], type: "hinge" },
            { id: "torso", position: { x: 48, y: 50 }, connections: ["neck", "right_shoulder", "left_shoulder", "pelvis"], type: "fixed" },
            { id: "pelvis", position: { x: 48, y: 65 }, connections: ["torso", "right_hip", "left_hip"], type: "ball" },
            { id: "right_shoulder", position: { x: 35, y: 40 }, connections: ["torso", "right_elbow"], type: "ball" },
            { id: "right_elbow", position: { x: 30, y: 50 }, connections: ["right_shoulder", "right_hand"], type: "hinge" },
            { id: "right_hand", position: { x: 25, y: 60 }, connections: ["right_elbow"], type: "ball" },
            { id: "left_shoulder", position: { x: 62, y: 40 }, connections: ["torso", "left_elbow"], type: "ball" },
            { id: "left_elbow", position: { x: 67, y: 50 }, connections: ["left_shoulder", "left_hand"], type: "hinge" },
            { id: "left_hand", position: { x: 72, y: 60 }, connections: ["left_elbow"], type: "ball" },
            { id: "right_hip", position: { x: 43, y: 65 }, connections: ["pelvis", "right_knee"], type: "ball" },
            { id: "right_knee", position: { x: 41, y: 80 }, connections: ["right_hip", "right_foot"], type: "hinge" },
            { id: "right_foot", position: { x: 39, y: 95 }, connections: ["right_knee"], type: "ball" },
            { id: "left_hip", position: { x: 53, y: 65 }, connections: ["pelvis", "left_knee"], type: "ball" },
            { id: "left_knee", position: { x: 55, y: 80 }, connections: ["left_hip", "left_foot"], type: "hinge" },
            { id: "left_foot", position: { x: 57, y: 95 }, connections: ["left_knee"], type: "ball" }
          ],
          bones: [
            { id: "spine", from: "head", to: "pelvis", length: 40 },
            { id: "right_upper_arm", from: "right_shoulder", to: "right_elbow", length: 15 },
            { id: "right_forearm", from: "right_elbow", to: "right_hand", length: 12 },
            { id: "left_upper_arm", from: "left_shoulder", to: "left_elbow", length: 15 },
            { id: "left_forearm", from: "left_elbow", to: "left_hand", length: 12 },
            { id: "right_thigh", from: "right_hip", to: "right_knee", length: 18 },
            { id: "right_shin", from: "right_knee", to: "right_foot", length: 16 },
            { id: "left_thigh", from: "left_hip", to: "left_knee", length: 18 },
            { id: "left_shin", from: "left_knee", to: "left_foot", length: 16 }
          ]
        },
        parts: [
          {
            name: "الرأس",
            confidence: 0.98,
            boundingBox: { x: 40, y: 15, width: 16, height: 20 },
            layer: 3,
            joints: [
              { x: 48, y: 25, type: "head" },
              { x: 46, y: 20, type: "left_eye" },
              { x: 52, y: 20, type: "right_eye" }
            ]
          },
          {
            name: "الجذع",
            confidence: 0.95,
            boundingBox: { x: 35, y: 35, width: 26, height: 30 },
            layer: 2,
            joints: [
              { x: 48, y: 35, type: "neck" },
              { x: 48, y: 50, type: "torso" },
              { x: 35, y: 40, type: "right_shoulder" },
              { x: 62, y: 40, type: "left_shoulder" }
            ]
          },
          {
            name: "الذراع اليمنى",
            confidence: 0.92,
            boundingBox: { x: 20, y: 35, width: 20, height: 30 },
            layer: 1,
            joints: [
              { x: 35, y: 40, type: "right_shoulder" },
              { x: 30, y: 50, type: "right_elbow" },
              { x: 25, y: 60, type: "right_hand" }
            ]
          },
          {
            name: "الذراع اليسرى",
            confidence: 0.89,
            boundingBox: { x: 62, y: 35, width: 15, height: 30 },
            layer: 1,
            joints: [
              { x: 62, y: 40, type: "left_shoulder" },
              { x: 67, y: 50, type: "left_elbow" },
              { x: 72, y: 60, type: "left_hand" }
            ]
          },
          {
            name: "الساق اليمنى",
            confidence: 0.94,
            boundingBox: { x: 36, y: 65, width: 12, height: 35 },
            layer: 1,
            joints: [
              { x: 43, y: 65, type: "right_hip" },
              { x: 41, y: 80, type: "right_knee" },
              { x: 39, y: 95, type: "right_foot" }
            ]
          },
          {
            name: "الساق اليسرى",
            confidence: 0.91,
            boundingBox: { x: 50, y: 65, width: 12, height: 35 },
            layer: 1,
            joints: [
              { x: 53, y: 65, type: "left_hip" },
              { x: 55, y: 80, type: "left_knee" },
              { x: 57, y: 95, type: "left_foot" }
            ]
          },
          {
            name: "السلاح (العصا المسننة)",
            confidence: 0.87,
            boundingBox: { x: 15, y: 55, width: 8, height: 25 },
            layer: 1,
            joints: [
              { x: 19, y: 60, type: "weapon_grip" },
              { x: 19, y: 70, type: "weapon_mid" },
              { x: 19, y: 80, type: "weapon_tip" }
            ]
          },
          {
            name: "الفرو/الزي",
            confidence: 0.85,
            boundingBox: { x: 30, y: 30, width: 36, height: 40 },
            layer: 0,
            joints: []
          }
        ]
      };

      return mockAnalysis;
    } catch (error) {
      console.error("Character analysis failed:", error);
      throw new Error("Failed to analyze character");
    }
  }

  async analyzeImageWithAI(base64Image: string): Promise<any> {
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in character analysis for 2D game sprites. Analyze the character image and identify body parts, skeletal structure, and animation potential. Respond with detailed JSON analysis."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this 2D game character sprite and provide detailed information about body parts, skeletal joints, center of mass, and animation capabilities. Include confidence scores for each detected part."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("AI analysis failed:", error);
      throw new Error("Failed to analyze image with AI");
    }
  }
}

export const characterAnalysisService = new CharacterAnalysisService();
