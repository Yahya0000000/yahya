import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  Wand2, 
  Gamepad2, 
  Sliders, 
  Play, 
  Eye,
  Video,
  Settings,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import SliderInput from "@/components/ui/slider-input";
import FileUpload from "@/components/ui/file-upload";
import { apiRequest } from "@/lib/queryClient";

interface AnimationControlsPanelProps {
  characterId: number | null;
  animationState: any;
  onStateChange: (updates: any) => void;
}

export default function AnimationControlsPanel({ 
  characterId, 
  animationState, 
  onStateChange 
}: AnimationControlsPanelProps) {
  const [videoProcessingProgress, setVideoProcessingProgress] = useState(0);

  const generateAnimationMutation = useMutation({
    mutationFn: async (animationType: string) => {
      if (!characterId) throw new Error("No character selected");
      
      const response = await apiRequest("POST", `/api/characters/${characterId}/animations`, {
        type: animationType,
        properties: {
          speed: animationState.speed,
          smoothness: animationState.smoothness,
          physicsEnabled: animationState.physicsEnabled,
          muscleSimulation: animationState.muscleSimulation,
          clothPhysics: animationState.clothPhysics,
          fps: 30
        }
      });
      return response.json();
    },
    onSuccess: () => {
      console.log("Animation generated successfully");
    }
  });

  const previewAnimationMutation = useMutation({
    mutationFn: async (animationId: number) => {
      const response = await apiRequest("GET", `/api/animations/${animationId}/preview`);
      return response.json();
    }
  });

  const handleVideoUpload = async (file: File) => {
    try {
      setVideoProcessingProgress(0);
      const formData = new FormData();
      formData.append('video', file);
      formData.append('name', file.name);
      formData.append('userId', '1');

      const response = await fetch('/api/game-videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      // Simulate processing progress
      const interval = setInterval(() => {
        setVideoProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

    } catch (error) {
      console.error("Video upload failed:", error);
    }
  };

  const animationPresets = [
    { key: 'walk', name: 'مشي', icon: '🚶' },
    { key: 'run', name: 'جري', icon: '🏃' },
    { key: 'attack', name: 'هجوم', icon: '⚔️' },
    { key: 'defense', name: 'دفاع', icon: '🛡️' },
    { key: 'idle', name: 'خمول', icon: '💤' },
    { key: 'death', name: 'موت', icon: '💀' },
  ];

  return (
    <div className="w-80 bg-dark-secondary panel-border flex flex-col">
      {/* Animation Presets */}
      <div className="p-4 border-b border-dark-tertiary">
        <h3 className="font-semibold mb-3 flex items-center text-text-primary">
          <Wand2 className="ml-2 text-accent-blue" size={16} />
          حركات تلقائية
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {animationPresets.map((preset) => (
            <Button
              key={preset.key}
              variant="outline"
              size="sm"
              className="bg-dark-primary hover:bg-accent-blue text-xs p-2 h-auto flex flex-col"
              onClick={() => generateAnimationMutation.mutate(preset.key)}
              disabled={!characterId || generateAnimationMutation.isPending}
            >
              <span className="text-lg mb-1">{preset.icon}</span>
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Game Animation Import */}
      <div className="p-4 border-b border-dark-tertiary">
        <h3 className="font-semibold mb-3 flex items-center text-text-primary">
          <Gamepad2 className="ml-2 text-accent-green" size={16} />
          تقليد حركة الألعاب
        </h3>
        <div className="space-y-3">
          <FileUpload
            onFileSelect={handleVideoUpload}
            acceptedTypes={["video/mp4", "video/avi", "video/mov"]}
            maxSize={100 * 1024 * 1024} // 100MB
          >
            <Button className="w-full bg-dark-primary hover:bg-accent-green text-sm p-2">
              <Video className="w-4 h-4 mr-2" />
              استيراد فيديو gameplay
            </Button>
          </FileUpload>
          
          {videoProcessingProgress > 0 && (
            <div className="bg-dark-primary rounded p-2 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-primary">تحليل الحركة</span>
                <span className="text-accent-orange">
                  {videoProcessingProgress === 100 ? "مكتمل" : "معالجة..."}
                </span>
              </div>
              <Progress value={videoProcessingProgress} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* Animation Properties */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3 flex items-center text-text-primary">
          <Sliders className="ml-2 text-accent-blue" size={16} />
          خصائص الحركة
        </h3>
        <div className="space-y-4">
          <SliderInput
            label="سرعة الحركة"
            value={animationState.speed || 1.0}
            min={0.1}
            max={3.0}
            step={0.1}
            onChange={(value) => onStateChange({ speed: value })}
            displayValue={`${animationState.speed || 1.0}x`}
          />

          <SliderInput
            label="نعومة الحركة"
            value={animationState.smoothness || 0.8}
            min={0}
            max={1}
            step={0.1}
            onChange={(value) => onStateChange({ smoothness: value })}
            leftLabel="حاد"
            rightLabel="ناعم"
          />

          <div className="space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="physics"
                checked={animationState.physicsEnabled || false}
                onCheckedChange={(checked) => onStateChange({ physicsEnabled: checked })}
              />
              <label htmlFor="physics" className="text-sm text-text-primary cursor-pointer">
                تفعيل الفيزياء
              </label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="muscle"
                checked={animationState.muscleSimulation || false}
                onCheckedChange={(checked) => onStateChange({ muscleSimulation: checked })}
              />
              <label htmlFor="muscle" className="text-sm text-text-primary cursor-pointer">
                محاكاة العضلات
              </label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="cloth"
                checked={animationState.clothPhysics || false}
                onCheckedChange={(checked) => onStateChange({ clothPhysics: checked })}
              />
              <label htmlFor="cloth" className="text-sm text-text-primary cursor-pointer">
                فيزياء الأقمشة
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-tertiary">
            <h4 className="font-medium mb-3 text-text-primary flex items-center">
              <Activity className="ml-1" size={14} />
              مركز الثقل
            </h4>
            <div className="bg-dark-primary rounded p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-secondary">X:</span>
                <span className="font-mono text-text-primary">48.2px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Y:</span>
                <span className="font-mono text-text-primary">52.7px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">الكتلة:</span>
                <span className="font-mono text-text-primary">85.4kg</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="font-medium mb-3 text-text-primary">نقاط التحكم النشطة</h4>
            <div className="space-y-2">
              {['مفصل الكوع الأيمن', 'مفصل الكتف الأيسر', 'مفصل الركبة اليمنى'].map((joint, index) => (
                <div key={index} className="bg-dark-primary rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary">{joint}</span>
                    <Button variant="ghost" size="sm" className="text-accent-blue hover:text-blue-300 p-1">
                      <Settings size={12} />
                    </Button>
                  </div>
                  <div className="mt-1 text-text-secondary">
                    <span>الدوران: </span>
                    <span className="font-mono">{45 + index * 10}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-dark-tertiary space-y-2">
        <Button 
          className="w-full bg-accent-green hover:bg-green-600 font-medium"
          disabled={!characterId}
          onClick={() => generateAnimationMutation.mutate('custom')}
        >
          <Wand2 className="w-4 h-4 mr-2" />
          توليد الحركة
        </Button>
        <Button 
          variant="outline"
          className="w-full bg-accent-blue hover:bg-blue-600 font-medium"
          disabled={!characterId}
        >
          <Play className="w-4 h-4 mr-2" />
          معاينة الحركة
        </Button>
      </div>
    </div>
  );
}
