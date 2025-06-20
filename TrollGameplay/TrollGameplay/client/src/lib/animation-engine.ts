interface Joint {
  id: string;
  position: { x: number; y: number };
  rotation: number;
  connections: string[];
  type: 'ball' | 'hinge' | 'fixed';
}

interface Bone {
  id: string;
  from: string;
  to: string;
  length: number;
  currentLength?: number;
}

interface Keyframe {
  frame: number;
  joints: Record<string, {
    position: { x: number; y: number };
    rotation: number;
    scale: { x: number; y: number };
  }>;
}

interface AnimationClip {
  id: string;
  name: string;
  type: string;
  keyframes: Keyframe[];
  duration: number;
  fps: number;
}

interface PhysicsProperties {
  gravity: number;
  damping: number;
  stiffness: number;
  mass: number;
}

class AnimationEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private currentAnimation: AnimationClip | null = null;
  private isPlaying = false;
  private currentFrame = 0;
  private playbackSpeed = 1.0;
  private animationFrame: number | null = null;
  
  // Physics simulation
  private physicsEnabled = true;
  private physicsProperties: PhysicsProperties = {
    gravity: 9.81,
    damping: 0.95,
    stiffness: 0.8,
    mass: 1.0
  };

  // Skeleton data
  private joints: Map<string, Joint> = new Map();
  private bones: Map<string, Bone> = new Map();
  private constraints: Array<{ from: string; to: string; restLength: number }> = [];

  // Animation state
  private velocities: Map<string, { x: number; y: number }> = new Map();
  private forces: Map<string, { x: number; y: number }> = new Map();

  initialize(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupDefaultSkeleton();
  }

  private setupDefaultSkeleton() {
    // Default troll character skeleton
    const defaultJoints: Joint[] = [
      { id: 'head', position: { x: 48, y: 25 }, rotation: 0, connections: ['neck'], type: 'ball' },
      { id: 'neck', position: { x: 48, y: 35 }, rotation: 0, connections: ['head', 'torso'], type: 'hinge' },
      { id: 'torso', position: { x: 48, y: 50 }, rotation: 0, connections: ['neck', 'right_shoulder', 'left_shoulder', 'pelvis'], type: 'fixed' },
      { id: 'pelvis', position: { x: 48, y: 65 }, rotation: 0, connections: ['torso', 'right_hip', 'left_hip'], type: 'ball' },
      { id: 'right_shoulder', position: { x: 35, y: 40 }, rotation: 0, connections: ['torso', 'right_elbow'], type: 'ball' },
      { id: 'right_elbow', position: { x: 30, y: 50 }, rotation: 0, connections: ['right_shoulder', 'right_hand'], type: 'hinge' },
      { id: 'right_hand', position: { x: 25, y: 60 }, rotation: 0, connections: ['right_elbow'], type: 'ball' },
      { id: 'left_shoulder', position: { x: 62, y: 40 }, rotation: 0, connections: ['torso', 'left_elbow'], type: 'ball' },
      { id: 'left_elbow', position: { x: 67, y: 50 }, rotation: 0, connections: ['left_shoulder', 'left_hand'], type: 'hinge' },
      { id: 'left_hand', position: { x: 72, y: 60 }, rotation: 0, connections: ['left_elbow'], type: 'ball' },
      { id: 'right_hip', position: { x: 43, y: 65 }, rotation: 0, connections: ['pelvis', 'right_knee'], type: 'ball' },
      { id: 'right_knee', position: { x: 41, y: 80 }, rotation: 0, connections: ['right_hip', 'right_foot'], type: 'hinge' },
      { id: 'right_foot', position: { x: 39, y: 95 }, rotation: 0, connections: ['right_knee'], type: 'ball' },
      { id: 'left_hip', position: { x: 53, y: 65 }, rotation: 0, connections: ['pelvis', 'left_knee'], type: 'ball' },
      { id: 'left_knee', position: { x: 55, y: 80 }, rotation: 0, connections: ['left_hip', 'left_foot'], type: 'hinge' },
      { id: 'left_foot', position: { x: 57, y: 95 }, rotation: 0, connections: ['left_knee'], type: 'ball' }
    ];

    const defaultBones: Bone[] = [
      { id: 'spine', from: 'head', to: 'pelvis', length: 40 },
      { id: 'right_upper_arm', from: 'right_shoulder', to: 'right_elbow', length: 15 },
      { id: 'right_forearm', from: 'right_elbow', to: 'right_hand', length: 12 },
      { id: 'left_upper_arm', from: 'left_shoulder', to: 'left_elbow', length: 15 },
      { id: 'left_forearm', from: 'left_elbow', to: 'left_hand', length: 12 },
      { id: 'right_thigh', from: 'right_hip', to: 'right_knee', length: 18 },
      { id: 'right_shin', from: 'right_knee', to: 'right_foot', length: 16 },
      { id: 'left_thigh', from: 'left_hip', to: 'left_knee', length: 18 },
      { id: 'left_shin', from: 'left_knee', to: 'left_foot', length: 16 }
    ];

    // Initialize joints
    defaultJoints.forEach(joint => {
      this.joints.set(joint.id, joint);
      this.velocities.set(joint.id, { x: 0, y: 0 });
      this.forces.set(joint.id, { x: 0, y: 0 });
    });

    // Initialize bones
    defaultBones.forEach(bone => {
      this.bones.set(bone.id, bone);
      this.constraints.push({
        from: bone.from,
        to: bone.to,
        restLength: bone.length
      });
    });
  }

  loadAnimation(animation: AnimationClip) {
    this.currentAnimation = animation;
    this.currentFrame = 0;
    this.isPlaying = false;
  }

  playAnimation(animation: any, fps: number = 30) {
    if (!this.canvas || !this.ctx) return;

    this.isPlaying = true;
    this.currentFrame = 0;

    const animate = () => {
      if (!this.isPlaying) return;

      this.update();
      this.render();

      this.currentFrame++;
      if (this.currentFrame >= (animation.frames || 30)) {
        this.currentFrame = 0;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  pauseAnimation() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  stopAnimation() {
    this.isPlaying = false;
    this.currentFrame = 0;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.1, Math.min(3.0, speed));
  }

  enablePhysics(enabled: boolean) {
    this.physicsEnabled = enabled;
  }

  setPhysicsProperties(properties: Partial<PhysicsProperties>) {
    this.physicsProperties = { ...this.physicsProperties, ...properties };
  }

  private update() {
    if (!this.currentAnimation) return;

    // Apply animation keyframes
    this.applyKeyframeInterpolation();

    // Apply physics if enabled
    if (this.physicsEnabled) {
      this.updatePhysics();
    }

    // Apply constraints
    this.applyConstraints();
  }

  private applyKeyframeInterpolation() {
    if (!this.currentAnimation) return;

    const frameTime = this.currentFrame / this.currentAnimation.fps;
    const keyframes = this.currentAnimation.keyframes;

    // Find surrounding keyframes
    let prevKeyframe = keyframes[0];
    let nextKeyframe = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      const curr = keyframes[i];
      const next = keyframes[i + 1];
      
      if (frameTime >= curr.frame / this.currentAnimation.fps && 
          frameTime <= next.frame / this.currentAnimation.fps) {
        prevKeyframe = curr;
        nextKeyframe = next;
        break;
      }
    }

    // Interpolate between keyframes
    const t = this.calculateInterpolationFactor(prevKeyframe, nextKeyframe, frameTime);

    Object.keys(prevKeyframe.joints).forEach(jointId => {
      const joint = this.joints.get(jointId);
      if (!joint) return;

      const prevJointData = prevKeyframe.joints[jointId];
      const nextJointData = nextKeyframe.joints[jointId];

      if (prevJointData && nextJointData) {
        // Linear interpolation for position
        joint.position.x = this.lerp(prevJointData.position.x, nextJointData.position.x, t);
        joint.position.y = this.lerp(prevJointData.position.y, nextJointData.position.y, t);
        
        // Slerp for rotation
        joint.rotation = this.lerpAngle(prevJointData.rotation, nextJointData.rotation, t);
      }
    });
  }

  private updatePhysics() {
    const deltaTime = 1 / 60; // 60 FPS physics

    this.joints.forEach((joint, jointId) => {
      const velocity = this.velocities.get(jointId)!;
      const force = this.forces.get(jointId)!;

      // Apply gravity
      force.y += this.physicsProperties.gravity * this.physicsProperties.mass;

      // Update velocity
      velocity.x += force.x * deltaTime / this.physicsProperties.mass;
      velocity.y += force.y * deltaTime / this.physicsProperties.mass;

      // Apply damping
      velocity.x *= this.physicsProperties.damping;
      velocity.y *= this.physicsProperties.damping;

      // Update position
      joint.position.x += velocity.x * deltaTime;
      joint.position.y += velocity.y * deltaTime;

      // Reset forces
      force.x = 0;
      force.y = 0;
    });
  }

  private applyConstraints() {
    // Apply distance constraints between connected joints
    this.constraints.forEach(constraint => {
      const joint1 = this.joints.get(constraint.from);
      const joint2 = this.joints.get(constraint.to);

      if (!joint1 || !joint2) return;

      const dx = joint2.position.x - joint1.position.x;
      const dy = joint2.position.y - joint1.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const difference = constraint.restLength - distance;
        const percent = difference / distance / 2;
        const offsetX = dx * percent * this.physicsProperties.stiffness;
        const offsetY = dy * percent * this.physicsProperties.stiffness;

        joint1.position.x -= offsetX;
        joint1.position.y -= offsetY;
        joint2.position.x += offsetX;
        joint2.position.y += offsetY;
      }
    });
  }

  private render() {
    if (!this.canvas || !this.ctx) return;

    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render skeleton
    this.renderSkeleton();
  }

  private renderSkeleton() {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const canvas = this.canvas;

    // Draw bones
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.8;

    this.bones.forEach(bone => {
      const fromJoint = this.joints.get(bone.from);
      const toJoint = this.joints.get(bone.to);

      if (fromJoint && toJoint) {
        const x1 = (fromJoint.position.x / 100) * canvas.width;
        const y1 = (fromJoint.position.y / 100) * canvas.height;
        const x2 = (toJoint.position.x / 100) * canvas.width;
        const y2 = (toJoint.position.y / 100) * canvas.height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Draw joints
    this.joints.forEach(joint => {
      const x = (joint.position.x / 100) * canvas.width;
      const y = (joint.position.y / 100) * canvas.height;
      const size = joint.type === 'ball' ? 8 : joint.type === 'hinge' ? 6 : 4;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = joint.type === 'ball' ? '#ff9800' : '#ffa726';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
  }

  private calculateInterpolationFactor(prevKeyframe: Keyframe, nextKeyframe: Keyframe, currentTime: number): number {
    const prevTime = prevKeyframe.frame / (this.currentAnimation?.fps || 30);
    const nextTime = nextKeyframe.frame / (this.currentAnimation?.fps || 30);
    
    if (nextTime === prevTime) return 0;
    
    return (currentTime - prevTime) / (nextTime - prevTime);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private lerpAngle(a: number, b: number, t: number): number {
    const difference = b - a;
    const distance = ((difference % 360) + 540) % 360 - 180;
    return a + distance * t;
  }

  // Advanced animation generation methods
  generateWalkCycle(duration: number = 2.0, fps: number = 30): AnimationClip {
    const totalFrames = Math.floor(duration * fps);
    const keyframes: Keyframe[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      const walkCycle = Math.sin(t * Math.PI * 4) * 0.5;
      
      const joints: Record<string, any> = {};
      
      // Generate walk cycle for each joint
      this.joints.forEach((joint, jointId) => {
        joints[jointId] = this.generateWalkMotion(joint, t, walkCycle);
      });

      keyframes.push({ frame, joints });
    }

    return {
      id: `walk_${Date.now()}`,
      name: 'Walk Cycle',
      type: 'walk',
      keyframes,
      duration,
      fps
    };
  }

  private generateWalkMotion(joint: Joint, t: number, walkCycle: number) {
    const basePosition = { ...joint.position };
    const motion = { position: basePosition, rotation: 0, scale: { x: 1, y: 1 } };

    switch (joint.id) {
      case 'torso':
        motion.position.y = basePosition.y + Math.sin(t * Math.PI * 8) * 2;
        motion.rotation = Math.sin(t * Math.PI * 4) * 5;
        break;
      case 'right_shoulder':
        motion.rotation = walkCycle * 30;
        break;
      case 'left_shoulder':
        motion.rotation = -walkCycle * 30;
        break;
      case 'right_hip':
        motion.rotation = walkCycle * 25;
        break;
      case 'left_hip':
        motion.rotation = -walkCycle * 25;
        break;
      case 'head':
        motion.position.y = basePosition.y + Math.sin(t * Math.PI * 8) * 1;
        motion.rotation = Math.sin(t * Math.PI * 4) * 3;
        break;
    }

    return motion;
  }

  // Muscle and cloth simulation
  simulateMuscleDeformation(jointId: string, tension: number) {
    const joint = this.joints.get(jointId);
    if (!joint) return;

    // Apply muscle tension effects
    const connectedJoints = joint.connections.map(id => this.joints.get(id)).filter(Boolean);
    
    connectedJoints.forEach(connectedJoint => {
      if (!connectedJoint) return;
      
      const force = this.forces.get(connectedJoint.id);
      if (force) {
        // Apply tension force towards the muscle joint
        const dx = joint.position.x - connectedJoint.position.x;
        const dy = joint.position.y - connectedJoint.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          force.x += (dx / distance) * tension;
          force.y += (dy / distance) * tension;
        }
      }
    });
  }

  simulateClothPhysics(windForce: { x: number; y: number } = { x: 0, y: 0 }) {
    // Apply wind and gravity to cloth-like elements
    this.joints.forEach((joint, jointId) => {
      if (jointId.includes('cloth') || jointId.includes('fur')) {
        const force = this.forces.get(jointId);
        if (force) {
          force.x += windForce.x;
          force.y += windForce.y + this.physicsProperties.gravity * 0.1;
        }
      }
    });
  }

  // Game animation extraction simulation
  extractAnimationFromGameplay(frames: any[]): AnimationClip {
    // This would integrate with computer vision in production
    // For now, generate a realistic animation based on frame analysis
    
    const fps = 30;
    const duration = frames.length / fps;
    const keyframes: Keyframe[] = [];

    frames.forEach((frame, index) => {
      const t = index / frames.length;
      const joints: Record<string, any> = {};
      
      // Simulate motion extraction from gameplay video
      this.joints.forEach((joint, jointId) => {
        joints[jointId] = {
          position: {
            x: joint.position.x + Math.sin(t * Math.PI * 6) * 5,
            y: joint.position.y + Math.cos(t * Math.PI * 4) * 3
          },
          rotation: Math.sin(t * Math.PI * 8) * 10,
          scale: { x: 1, y: 1 }
        };
      });

      keyframes.push({ frame: index, joints });
    });

    return {
      id: `extracted_${Date.now()}`,
      name: 'Extracted Animation',
      type: 'extracted',
      keyframes,
      duration,
      fps
    };
  }

  // Export animation data
  exportAnimation(format: 'json' | 'bvh' | 'fbx' = 'json'): string {
    if (!this.currentAnimation) return '';

    switch (format) {
      case 'json':
        return JSON.stringify(this.currentAnimation, null, 2);
      case 'bvh':
        return this.exportToBVH();
      case 'fbx':
        return this.exportToFBX();
      default:
        return '';
    }
  }

  private exportToBVH(): string {
    // BVH export implementation
    let bvh = 'HIERARCHY\n';
    bvh += 'ROOT root\n{\n';
    bvh += '  OFFSET 0.00 0.00 0.00\n';
    bvh += '  CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n';
    
    // Add joint hierarchy
    this.joints.forEach((joint, jointId) => {
      bvh += `  JOINT ${jointId}\n  {\n`;
      bvh += `    OFFSET ${joint.position.x} ${joint.position.y} 0.00\n`;
      bvh += `    CHANNELS 3 Zrotation Xrotation Yrotation\n`;
      bvh += '  }\n';
    });
    
    bvh += '}\n';
    
    // Add motion data
    bvh += 'MOTION\n';
    bvh += `Frames: ${this.currentAnimation?.keyframes.length || 0}\n`;
    bvh += `Frame Time: ${1 / (this.currentAnimation?.fps || 30)}\n`;
    
    // Add frame data
    this.currentAnimation?.keyframes.forEach(keyframe => {
      let frameData = '0.00 0.00 0.00 0.00 0.00 0.00 ';
      Object.values(keyframe.joints).forEach(jointData => {
        frameData += `${jointData.rotation} 0.00 0.00 `;
      });
      bvh += frameData + '\n';
    });
    
    return bvh;
  }

  private exportToFBX(): string {
    // FBX export would require a proper FBX library
    // This is a simplified representation
    return `; FBX Export\n; Character Animation Data\n; Generated by Smart Animation Engine\n`;
  }
}

export const animationEngine = new AnimationEngine();
