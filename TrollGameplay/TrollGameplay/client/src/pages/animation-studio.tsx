import { useState } from "react";
import CharacterAnalysisPanel from "@/components/character-analysis-panel";
import CharacterViewport from "@/components/character-viewport";
import AnimationControlsPanel from "@/components/animation-controls-panel";
import TimelinePanel from "@/components/timeline-panel";
import { useAnimationState } from "@/hooks/use-animation-state";
import { Button } from "@/components/ui/button";
import { 
  Wand2, 
  File, 
  Edit, 
  BarChart3, 
  Play, 
  Download, 
  HelpCircle, 
  Settings, 
  PlayCircle 
} from "lucide-react";

export default function AnimationStudio() {
  const { animationState, updateAnimationState, isAnalyzing } = useAnimationState();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  const handleAnalysisStart = () => {
    updateAnimationState({ isAnalyzing: true });
  };

  return (
    <div className="animation-studio h-screen overflow-hidden" dir="rtl">
      {/* Top Menu Bar */}
      <div className="bg-dark-secondary panel-border h-12 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Wand2 className="text-accent-blue text-xl" />
            <h1 className="text-lg font-bold text-text-primary">محرك الرسوم المتحركة الذكي</h1>
          </div>
          <div className="h-6 w-px bg-dark-tertiary"></div>
          <nav className="flex space-x-6 space-x-reverse text-sm">
            <Button variant="ghost" size="sm" className="hover:text-accent-blue transition-colors">
              <File className="w-4 h-4 ml-1" />
              ملف
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-accent-blue transition-colors">
              <Edit className="w-4 h-4 ml-1" />
              تحرير
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-accent-blue transition-colors">
              <BarChart3 className="w-4 h-4 ml-1" />
              تحليل
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-accent-blue transition-colors">
              <Play className="w-4 h-4 ml-1" />
              حركة
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-accent-blue transition-colors">
              <Download className="w-4 h-4 ml-1" />
              تصدير
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-accent-blue transition-colors">
              <HelpCircle className="w-4 h-4 ml-1" />
              مساعدة
            </Button>
          </nav>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <Button 
            className="bg-accent-green hover:bg-green-600 text-sm font-medium"
            onClick={handleAnalysisStart}
            disabled={isAnalyzing}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {isAnalyzing ? "قيد التحليل..." : "تشغيل التحليل"}
          </Button>
          <Button variant="ghost" size="sm" className="hover:text-accent-blue">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Character Analysis */}
        <CharacterAnalysisPanel 
          onCharacterSelect={setSelectedCharacterId}
          selectedCharacterId={selectedCharacterId}
        />

        {/* Central Canvas Area */}
        <div className="flex-1 flex flex-col">
          <CharacterViewport 
            characterId={selectedCharacterId}
            animationState={animationState}
          />
        </div>

        {/* Right Sidebar - Animation Controls */}
        <AnimationControlsPanel 
          characterId={selectedCharacterId}
          animationState={animationState}
          onStateChange={updateAnimationState}
        />
      </div>

      {/* Bottom Timeline */}
      <TimelinePanel 
        characterId={selectedCharacterId}
        animationState={animationState}
        onStateChange={updateAnimationState}
      />
    </div>
  );
}
