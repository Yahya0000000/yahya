import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { animationEngine } from "@/lib/animation-engine";

interface AnimationState {
  // Animation properties
  speed: number;
  smoothness: number;
  physicsEnabled: boolean;
  muscleSimulation: boolean;
  clothPhysics: boolean;
  
  // Playback state
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  
  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: number;
  
  // Selected elements
  selectedKeyframe: string | null;
  selectedBone: string | null;
  
  // Physics and center of mass
  centerOfMass: { x: number; y: number };
  totalMass: number;
  
  // Active bones and joints
  activeBones: Array<{
    id: string;
    name: string;
    rotation: number;
    position: { x: number; y: number };
  }>;
}

const initialState: AnimationState = {
  speed: 1.0,
  smoothness: 0.8,
  physicsEnabled: true,
  muscleSimulation: true,
  clothPhysics: false,
  isPlaying: false,
  currentFrame: 0,
  totalFrames: 75,
  fps: 30,
  isAnalyzing: false,
  analysisProgress: 78,
  selectedKeyframe: null,
  selectedBone: null,
  centerOfMass: { x: 48.2, y: 52.7 },
  totalMass: 85.4,
  activeBones: [
    { id: 'right_elbow', name: 'مفصل الكوع الأيمن', rotation: 45, position: { x: 30, y: 50 } },
    { id: 'left_shoulder', name: 'مفصل الكتف الأيسر', rotation: 55, position: { x: 62, y: 40 } },
    { id: 'right_knee', name: 'مفصل الركبة اليمنى', rotation: 65, position: { x: 41, y: 80 } },
  ]
};

export function useAnimationState() {
  const [animationState, setAnimationState] = useState<AnimationState>(initialState);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateAnimationState = useCallback((updates: Partial<AnimationState>) => {
    setAnimationState(prev => ({ ...prev, ...updates }));
  }, []);

  const generateAnimation = useMutation({
    mutationFn: async ({ characterId, type, properties }: {
      characterId: number;
      type: string;
      properties?: Partial<AnimationState>;
    }) => {
      const animationProperties = {
        speed: properties?.speed || animationState.speed,
        smoothness: properties?.smoothness || animationState.smoothness,
        physicsEnabled: properties?.physicsEnabled || animationState.physicsEnabled,
        muscleSimulation: properties?.muscleSimulation || animationState.muscleSimulation,
        clothPhysics: properties?.clothPhysics || animationState.clothPhysics,
        fps: animationState.fps
      };

      const response = await apiRequest("POST", `/api/characters/${characterId}/animations`, {
        type,
        properties: animationProperties
      });
      return response.json();
    },
    onSuccess: (animation) => {
      toast({
        title: "تم توليد الحركة بنجاح",
        description: `تم إنشاء حركة ${animation.type} بمدة ${animation.duration} ثانية`,
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/characters/${animation.characterId}/animations`] });
      
      // Update animation state with new animation data
      updateAnimationState({
        totalFrames: animation.keyframes.length,
        currentFrame: 0,
        isPlaying: false
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في توليد الحركة",
        description: "فشل في إنشاء الحركة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const previewAnimation = useMutation({
    mutationFn: async (animationId: number) => {
      const response = await apiRequest("GET", `/api/animations/${animationId}/preview`);
      return response.json();
    },
    onSuccess: (preview) => {
      updateAnimationState({
        isPlaying: true,
        currentFrame: 0,
        totalFrames: preview.frames
      });
      
      // Start animation playback
      animationEngine.playAnimation(preview, animationState.fps);
    }
  });

  const processGameVideo = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('name', file.name);
      formData.append('userId', '1');

      const response = await fetch('/api/game-videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Video upload failed');
      return response.json();
    },
    onSuccess: (gameVideo) => {
      toast({
        title: "تم رفع الفيديو بنجاح",
        description: "جاري تحليل الحركات المستخرجة من الفيديو...",
      });
      
      // Start polling for processing status
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/game-videos/${gameVideo.id}`);
          const updatedVideo = await response.json();
          
          if (updatedVideo.processingStatus === 'completed') {
            clearInterval(pollInterval);
            toast({
              title: "تم تحليل الفيديو بنجاح",
              description: `تم استخراج ${updatedVideo.extractedAnimations?.length || 0} حركة من الفيديو`,
            });
          } else if (updatedVideo.processingStatus === 'failed') {
            clearInterval(pollInterval);
            toast({
              title: "فشل في تحليل الفيديو",
              description: "حدث خطأ أثناء معالجة الفيديو",
              variant: "destructive",
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
        }
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "خطأ في رفع الفيديو",
        description: "فشل في رفع الفيديو. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const updateBoneRotation = useCallback((boneId: string, rotation: number) => {
    setAnimationState(prev => ({
      ...prev,
      activeBones: prev.activeBones.map(bone =>
        bone.id === boneId ? { ...bone, rotation } : bone
      )
    }));
  }, []);

  const selectKeyframe = useCallback((keyframeId: string, frame: number) => {
    updateAnimationState({
      selectedKeyframe: keyframeId,
      currentFrame: frame
    });
  }, [updateAnimationState]);

  const playAnimation = useCallback(() => {
    if (!animationState.isPlaying) {
      updateAnimationState({ isPlaying: true });
      
      const interval = setInterval(() => {
        setAnimationState(prev => {
          const nextFrame = prev.currentFrame + 1;
          
          if (nextFrame >= prev.totalFrames) {
            clearInterval(interval);
            return { ...prev, isPlaying: false, currentFrame: 0 };
          }
          
          return { ...prev, currentFrame: nextFrame };
        });
      }, 1000 / animationState.fps);
    }
  }, [animationState.isPlaying, animationState.fps, updateAnimationState]);

  const pauseAnimation = useCallback(() => {
    updateAnimationState({ isPlaying: false });
  }, [updateAnimationState]);

  const resetAnimation = useCallback(() => {
    updateAnimationState({
      isPlaying: false,
      currentFrame: 0,
      selectedKeyframe: null
    });
  }, [updateAnimationState]);

  return {
    animationState,
    updateAnimationState,
    generateAnimation: generateAnimation.mutateAsync,
    previewAnimation: previewAnimation.mutateAsync,
    processGameVideo: processGameVideo.mutateAsync,
    updateBoneRotation,
    selectKeyframe,
    playAnimation,
    pauseAnimation,
    resetAnimation,
    isGenerating: generateAnimation.isPending,
    isPreviewing: previewAnimation.isPending,
    isProcessingVideo: processGameVideo.isPending,
    isAnalyzing: animationState.isAnalyzing,
  };
}
