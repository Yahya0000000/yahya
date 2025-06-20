import type { Character, CharacterPart, Animation } from "@shared/schema";

interface AnimationKeyframe {
  frame: number;
  joints: Record<string, {
    position: { x: number; y: number };
    rotation: number;
    scale: { x: number; y: number };
  }>;
}

interface AnimationProperties {
  speed?: number;
  smoothness?: number;
  physicsEnabled?: boolean;
  muscleSimulation?: boolean;
  clothPhysics?: boolean;
  fps?: number;
}

class AnimationGeneratorService {
  async generateAnimation(
    character: Character,
    parts: CharacterPart[],
    type: string,
    properties: AnimationProperties
  ): Promise<{ keyframes: AnimationKeyframe[]; duration: number }> {
    
    const fps = properties.fps || 30;
    const speed = properties.speed || 1.0;
    const smoothness = properties.smoothness || 0.8;
    
    let keyframes: AnimationKeyframe[] = [];
    let duration = 0;

    switch (type) {
      case 'walk':
        keyframes = this.generateWalkAnimation(parts, fps, speed);
        duration = 2.0 / speed; // 2 seconds base duration
        break;
      case 'run':
        keyframes = this.generateRunAnimation(parts, fps, speed);
        duration = 1.5 / speed;
        break;
      case 'attack':
        keyframes = this.generateAttackAnimation(parts, fps, speed);
        duration = 1.0 / speed;
        break;
      case 'idle':
        keyframes = this.generateIdleAnimation(parts, fps, speed);
        duration = 3.0 / speed;
        break;
      case 'jump':
        keyframes = this.generateJumpAnimation(parts, fps, speed);
        duration = 1.2 / speed;
        break;
      case 'death':
        keyframes = this.generateDeathAnimation(parts, fps, speed);
        duration = 2.5 / speed;
        break;
      default:
        throw new Error(`Animation type '${type}' not supported`);
    }

    if (properties.physicsEnabled) {
      keyframes = this.applyPhysics(keyframes, parts);
    }

    if (properties.muscleSimulation) {
      keyframes = this.applyMuscleSimulation(keyframes, parts);
    }

    if (smoothness > 0) {
      keyframes = this.applySmoothingFilter(keyframes, smoothness);
    }

    return { keyframes, duration };
  }

  private generateWalkAnimation(parts: CharacterPart[], fps: number, speed: number): AnimationKeyframe[] {
    const totalFrames = Math.floor(fps * 2.0 / speed); // 2 seconds
    const keyframes: AnimationKeyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      const walkCycle = Math.sin(t * Math.PI * 4) * 0.5; // 2 complete walk cycles
      
      const joints: Record<string, any> = {};
      
      // Torso slight up-down movement
      joints['torso'] = {
        position: { x: 48, y: 50 + Math.sin(t * Math.PI * 8) * 2 },
        rotation: Math.sin(t * Math.PI * 4) * 5,
        scale: { x: 1, y: 1 }
      };

      // Arms swinging
      joints['right_shoulder'] = {
        position: { x: 35, y: 40 },
        rotation: walkCycle * 30,
        scale: { x: 1, y: 1 }
      };

      joints['left_shoulder'] = {
        position: { x: 62, y: 40 },
        rotation: -walkCycle * 30,
        scale: { x: 1, y: 1 }
      };

      // Legs walking
      const legCycle = Math.sin(t * Math.PI * 4);
      joints['right_hip'] = {
        position: { x: 43, y: 65 },
        rotation: legCycle * 25,
        scale: { x: 1, y: 1 }
      };

      joints['left_hip'] = {
        position: { x: 53, y: 65 },
        rotation: -legCycle * 25,
        scale: { x: 1, y: 1 }
      };

      // Head slight bob
      joints['head'] = {
        position: { x: 48, y: 25 + Math.sin(t * Math.PI * 8) * 1 },
        rotation: Math.sin(t * Math.PI * 4) * 3,
        scale: { x: 1, y: 1 }
      };

      keyframes.push({ frame, joints });
    }

    return keyframes;
  }

  private generateRunAnimation(parts: CharacterPart[], fps: number, speed: number): AnimationKeyframe[] {
    const totalFrames = Math.floor(fps * 1.5 / speed);
    const keyframes: AnimationKeyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      const runCycle = Math.sin(t * Math.PI * 6) * 0.7; // Faster cycle
      
      const joints: Record<string, any> = {};
      
      // More pronounced torso movement
      joints['torso'] = {
        position: { x: 48, y: 50 + Math.sin(t * Math.PI * 12) * 3 },
        rotation: Math.sin(t * Math.PI * 6) * 8,
        scale: { x: 1, y: 1 }
      };

      // Aggressive arm swinging
      joints['right_shoulder'] = {
        position: { x: 35, y: 40 },
        rotation: runCycle * 50,
        scale: { x: 1, y: 1 }
      };

      joints['left_shoulder'] = {
        position: { x: 62, y: 40 },
        rotation: -runCycle * 50,
        scale: { x: 1, y: 1 }
      };

      // Dynamic leg movement
      const legCycle = Math.sin(t * Math.PI * 6);
      joints['right_hip'] = {
        position: { x: 43, y: 65 },
        rotation: legCycle * 40,
        scale: { x: 1, y: 1 }
      };

      joints['left_hip'] = {
        position: { x: 53, y: 65 },
        rotation: -legCycle * 40,
        scale: { x: 1, y: 1 }
      };

      keyframes.push({ frame, joints });
    }

    return keyframes;
  }

  private generateAttackAnimation(parts: CharacterPart[], fps: number, speed: number): AnimationKeyframe[] {
    const totalFrames = Math.floor(fps * 1.0 / speed);
    const keyframes: AnimationKeyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      
      const joints: Record<string, any> = {};
      
      // Attack wind-up and strike
      const attackPhase = t < 0.3 ? 'windup' : t < 0.7 ? 'strike' : 'recovery';
      
      let armRotation = 0;
      if (attackPhase === 'windup') {
        armRotation = -45 * (t / 0.3);
      } else if (attackPhase === 'strike') {
        armRotation = -45 + 90 * ((t - 0.3) / 0.4);
      } else {
        armRotation = 45 - 45 * ((t - 0.7) / 0.3);
      }

      joints['right_shoulder'] = {
        position: { x: 35, y: 40 },
        rotation: armRotation,
        scale: { x: 1, y: 1 }
      };

      // Torso twist
      joints['torso'] = {
        position: { x: 48, y: 50 },
        rotation: armRotation * 0.3,
        scale: { x: 1, y: 1 }
      };

      keyframes.push({ frame, joints });
    }

    return keyframes;
  }

  private generateIdleAnimation(parts: CharacterPart[], fps: number, speed: number): AnimationKeyframe[] {
    const totalFrames = Math.floor(fps * 3.0 / speed);
    const keyframes: AnimationKeyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      
      const joints: Record<string, any> = {};
      
      // Gentle breathing motion
      const breathCycle = Math.sin(t * Math.PI * 4) * 0.5;
      
      joints['torso'] = {
        position: { x: 48, y: 50 + breathCycle },
        rotation: breathCycle * 2,
        scale: { x: 1 + breathCycle * 0.02, y: 1 + breathCycle * 0.02 }
      };

      // Subtle head movement
      joints['head'] = {
        position: { x: 48, y: 25 + breathCycle * 0.5 },
        rotation: Math.sin(t * Math.PI * 2) * 3,
        scale: { x: 1, y: 1 }
      };

      keyframes.push({ frame, joints });
    }

    return keyframes;
  }

  private generateJumpAnimation(parts: CharacterPart[], fps: number, speed: number): AnimationKeyframe[] {
    const totalFrames = Math.floor(fps * 1.2 / speed);
    const keyframes: AnimationKeyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      
      const joints: Record<string, any> = {};
      
      // Jump arc
      const jumpHeight = Math.sin(t * Math.PI) * 30;
      
      joints['torso'] = {
        position: { x: 48, y: 50 - jumpHeight },
        rotation: 0,
        scale: { x: 1, y: 1 }
      };

      // Arms raised during jump
      joints['right_shoulder'] = {
        position: { x: 35, y: 40 - jumpHeight },
        rotation: -30,
        scale: { x: 1, y: 1 }
      };

      joints['left_shoulder'] = {
        position: { x: 62, y: 40 - jumpHeight },
        rotation: -30,
        scale: { x: 1, y: 1 }
      };

      // Legs tucked during jump
      const legTuck = Math.sin(t * Math.PI) * 20;
      joints['right_hip'] = {
        position: { x: 43, y: 65 - jumpHeight },
        rotation: legTuck,
        scale: { x: 1, y: 1 }
      };

      joints['left_hip'] = {
        position: { x: 53, y: 65 - jumpHeight },
        rotation: legTuck,
        scale: { x: 1, y: 1 }
      };

      keyframes.push({ frame, joints });
    }

    return keyframes;
  }

  private generateDeathAnimation(parts: CharacterPart[], fps: number, speed: number): AnimationKeyframe[] {
    const totalFrames = Math.floor(fps * 2.5 / speed);
    const keyframes: AnimationKeyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      
      const joints: Record<string, any> = {};
      
      // Collapse sequence
      const collapseProgress = Math.min(t * 1.5, 1);
      
      joints['torso'] = {
        position: { x: 48, y: 50 + collapseProgress * 30 },
        rotation: collapseProgress * 90,
        scale: { x: 1, y: 1 - collapseProgress * 0.2 }
      };

      joints['head'] = {
        position: { x: 48, y: 25 + collapseProgress * 50 },
        rotation: collapseProgress * 45,
        scale: { x: 1, y: 1 }
      };

      // Arms fall limp
      joints['right_shoulder'] = {
        position: { x: 35, y: 40 + collapseProgress * 20 },
        rotation: collapseProgress * 60,
        scale: { x: 1, y: 1 }
      };

      joints['left_shoulder'] = {
        position: { x: 62, y: 40 + collapseProgress * 20 },
        rotation: -collapseProgress * 60,
        scale: { x: 1, y: 1 }
      };

      keyframes.push({ frame, joints });
    }

    return keyframes;
  }

  private applyPhysics(keyframes: AnimationKeyframe[], parts: CharacterPart[]): AnimationKeyframe[] {
    // Apply gravity, momentum, and collision physics
    return keyframes.map(keyframe => {
      const modifiedJoints = { ...keyframe.joints };
      
      // Apply gravity to vertical movements
      Object.keys(modifiedJoints).forEach(jointName => {
        const joint = modifiedJoints[jointName];
        if (joint.position.y > 50) { // Below center
          joint.position.y += 0.5; // Slight gravitational pull
        }
      });
      
      return { ...keyframe, joints: modifiedJoints };
    });
  }

  private applyMuscleSimulation(keyframes: AnimationKeyframe[], parts: CharacterPart[]): AnimationKeyframe[] {
    // Add muscle tension and relaxation effects
    return keyframes.map((keyframe, index) => {
      const modifiedJoints = { ...keyframe.joints };
      
      // Add slight tremor/muscle tension
      Object.keys(modifiedJoints).forEach(jointName => {
        const joint = modifiedJoints[jointName];
        const tremor = Math.sin(index * 0.5) * 0.2;
        joint.rotation += tremor;
      });
      
      return { ...keyframe, joints: modifiedJoints };
    });
  }

  private applySmoothingFilter(keyframes: AnimationKeyframe[], smoothness: number): AnimationKeyframe[] {
    if (keyframes.length < 3) return keyframes;
    
    const smoothedKeyframes = [...keyframes];
    
    for (let i = 1; i < keyframes.length - 1; i++) {
      const prev = keyframes[i - 1];
      const curr = keyframes[i];
      const next = keyframes[i + 1];
      
      Object.keys(curr.joints).forEach(jointName => {
        const prevJoint = prev.joints[jointName];
        const currJoint = curr.joints[jointName];
        const nextJoint = next.joints[jointName];
        
        if (prevJoint && currJoint && nextJoint) {
          // Smooth position
          currJoint.position.x = this.lerp(currJoint.position.x, 
            (prevJoint.position.x + nextJoint.position.x) / 2, smoothness * 0.3);
          currJoint.position.y = this.lerp(currJoint.position.y, 
            (prevJoint.position.y + nextJoint.position.y) / 2, smoothness * 0.3);
          
          // Smooth rotation
          currJoint.rotation = this.lerp(currJoint.rotation, 
            (prevJoint.rotation + nextJoint.rotation) / 2, smoothness * 0.3);
        }
      });
    }
    
    return smoothedKeyframes;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  async generatePreview(animation: Animation): Promise<any> {
    return {
      frames: animation.keyframes.length,
      duration: animation.duration,
      fps: animation.fps,
      previewUrl: `/api/animations/${animation.id}/frames`,
      thumbnails: this.generateThumbnails(animation)
    };
  }

  private generateThumbnails(animation: Animation): string[] {
    // Generate thumbnail URLs for preview
    const thumbnailCount = Math.min(6, animation.keyframes.length);
    const interval = Math.floor(animation.keyframes.length / thumbnailCount);
    
    return Array.from({ length: thumbnailCount }, (_, i) => 
      `/api/animations/${animation.id}/thumbnail/${i * interval}`
    );
  }
}

export const animationGeneratorService = new AnimationGeneratorService();
