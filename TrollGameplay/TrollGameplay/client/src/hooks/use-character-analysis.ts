import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AnalysisProgress {
  bodyPartDetection: number;
  depthAnalysis: number;
  skeletonGeneration: number;
}

export function useCharacterAnalysis() {
  const [analysisProgress, setAnalysisProgress] = useState(78);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadCharacter = useMutation({
    mutationFn: async (file: File, name: string) => {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', name);
      formData.append('userId', '1'); // Mock user ID for now

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 800);

      const response = await fetch('/api/characters', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        clearInterval(progressInterval);
        throw new Error('Failed to upload character');
      }

      const result = await response.json();
      
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setIsAnalyzing(false);

      return result.character;
    },
    onSuccess: (character) => {
      toast({
        title: "تم تحليل الشخصية بنجاح",
        description: `تم اكتشاف ${character.analysisData?.bodyParts?.length || 0} جزء من الجسم`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      queryClient.invalidateQueries({ queryKey: [`/api/characters/${character.id}/parts`] });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "خطأ في تحليل الشخصية",
        description: "فشل في تحليل الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });

  const analyzeCharacterParts = useMutation({
    mutationFn: async (characterId: number) => {
      const response = await apiRequest("POST", `/api/characters/${characterId}/analyze`, {});
      return response.json();
    },
    onSuccess: (data, characterId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/characters/${characterId}/parts`] });
      toast({
        title: "تم تحديث التحليل",
        description: "تم إعادة تحليل أجزاء الشخصية بنجاح",
      });
    }
  });

  const updatePartVisibility = useMutation({
    mutationFn: async ({ partId, isVisible }: { partId: number; isVisible: boolean }) => {
      const response = await apiRequest("PATCH", `/api/character-parts/${partId}`, {
        isVisible
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
    }
  });

  return {
    uploadCharacter: uploadCharacter.mutateAsync,
    analyzeCharacterParts: analyzeCharacterParts.mutateAsync,
    updatePartVisibility: updatePartVisibility.mutateAsync,
    analysisProgress,
    isAnalyzing,
    isUploading: uploadCharacter.isPending,
    isAnalyzingParts: analyzeCharacterParts.isPending,
  };
}
