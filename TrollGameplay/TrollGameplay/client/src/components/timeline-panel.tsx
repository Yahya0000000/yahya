import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward,
  Clock,
  Film,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TimelinePanelProps {
  characterId: number | null;
  animationState: any;
  onStateChange: (updates: any) => void;
}

export default function TimelinePanel({ 
  characterId, 
  animationState, 
  onStateChange 
}: TimelinePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedKeyframe, setSelectedKeyframe] = useState<number | null>(null);

  const { data: animations } = useQuery({
    queryKey: [`/api/characters/${characterId}/animations`],
    enabled: !!characterId,
  });

  const totalFrames = 75;
  const fps = 30;
  const duration = 2.5;

  const animationTracks = [
    {
      name: 'الرأس',
      keyframes: [0, 25, 75, 100].map(frame => ({ frame, id: `head_${frame}` }))
    },
    {
      name: 'الجذع',
      keyframes: [0, 33, 66, 100].map(frame => ({ frame, id: `torso_${frame}` }))
    },
    {
      name: 'الأذرع',
      keyframes: [0, 20, 40, 60, 80, 100].map(frame => ({ frame, id: `arms_${frame}` }))
    },
    {
      name: 'الساقين',
      keyframes: [0, 30, 60, 100].map(frame => ({ frame, id: `legs_${frame}` }))
    },
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    onStateChange({ isPlaying: !isPlaying });
  };

  const handleFrameChange = (frame: number) => {
    setCurrentFrame(frame);
    onStateChange({ currentFrame: frame });
  };

  const handleKeyframeClick = (keyframe: any) => {
    setSelectedKeyframe(keyframe.frame);
    setCurrentFrame(keyframe.frame);
    onStateChange({ currentFrame: keyframe.frame, selectedKeyframe: keyframe.id });
  };

  const timelineMarkers = Array.from({ length: 6 }, (_, i) => ({
    position: (i / 5) * 100,
    time: `${(i * duration / 5).toFixed(1)}s`
  }));

  return (
    <div className="h-32 bg-dark-secondary panel-border">
      {/* Timeline Header */}
      <div className="h-8 bg-dark-tertiary flex items-center justify-between px-4 text-sm">
        <div className="flex items-center space-x-4 space-x-reverse">
          <span className="font-medium text-text-primary flex items-center">
            <Film className="ml-1" size={14} />
            الخط الزمني للحركة
          </span>
          <div className="flex space-x-2 space-x-reverse">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 hover:text-accent-blue"
              onClick={() => handleFrameChange(0)}
            >
              <SkipBack size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 hover:text-accent-blue"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1 hover:text-accent-blue"
              onClick={() => handleFrameChange(totalFrames)}
            >
              <SkipForward size={14} />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse text-xs text-text-secondary">
          <span className="flex items-center">
            <Zap className="ml-1" size={12} />
            {fps} FPS
          </span>
          <span className="flex items-center">
            <Clock className="ml-1" size={12} />
            المدة: {duration}s
          </span>
          <span>الإطارات: {totalFrames}</span>
        </div>
      </div>
      
      {/* Timeline Content */}
      <div className="flex-1 p-2">
        <div className="timeline-track h-20 rounded relative overflow-hidden">
          {/* Timeline ruler */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-dark-tertiary flex items-center px-2">
            <div className="flex-1 relative">
              {timelineMarkers.map((marker, index) => (
                <div 
                  key={index}
                  className="absolute text-xs text-text-secondary" 
                  style={{ left: `${marker.position}%` }}
                >
                  {marker.time}
                </div>
              ))}
            </div>
          </div>
          
          {/* Animation tracks */}
          <div className="mt-6 space-y-1">
            {animationTracks.map((track, trackIndex) => (
              <div key={trackIndex} className="h-4 bg-dark-primary rounded flex items-center px-2 relative">
                <span className="text-xs text-text-secondary w-20">{track.name}</span>
                <div className="flex-1 relative ml-2">
                  {track.keyframes.map((keyframe, keyframeIndex) => (
                    <button
                      key={keyframe.id}
                      className={`keyframe-marker absolute w-3 h-3 -mt-1 rounded-full border-2 transition-all ${
                        selectedKeyframe === keyframe.frame
                          ? 'bg-accent-blue border-white scale-125'
                          : 'bg-accent-blue border-accent-blue hover:scale-110'
                      }`}
                      style={{ left: `${keyframe.frame}%` }}
                      onClick={() => handleKeyframeClick(keyframe)}
                      title={`${track.name} - Frame ${keyframe.frame}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-accent-blue z-10 transition-all duration-100"
            style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          >
            <div className="w-3 h-3 bg-accent-blue rounded-full -ml-1.5 -mt-1 border-2 border-white"></div>
          </div>
          
          {/* Frame scrubber */}
          <div className="absolute bottom-1 left-0 right-0 px-2">
            <Slider
              value={[currentFrame]}
              max={totalFrames}
              step={1}
              onValueChange={(value) => handleFrameChange(value[0])}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
