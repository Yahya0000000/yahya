import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MousePointer, 
  Hand, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize,
  Box,
  Crosshair
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CharacterViewportProps {
  characterId: number | null;
  animationState: any;
}

export default function CharacterViewport({ characterId, animationState }: CharacterViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'pan' | 'zoom-in' | 'zoom-out'>('select');
  const [zoom, setZoom] = useState(100);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [frame, setFrame] = useState(1);

  const { data: character } = useQuery({
    queryKey: [`/api/characters/${characterId}`],
    enabled: !!characterId,
  });

  const { data: characterParts } = useQuery({
    queryKey: [`/api/characters/${characterId}/parts`],
    enabled: !!characterId,
  });

  const toolbarButtons = [
    { key: 'select', icon: MousePointer, label: 'اختيار' },
    { key: 'pan', icon: Hand, label: 'تحريك' },
    { key: 'zoom-in', icon: ZoomIn, label: 'تكبير' },
    { key: 'zoom-out', icon: ZoomOut, label: 'تصغير' },
  ];

  const skeletonButtons = [
    { key: 'bones', icon: Box, label: 'العظام', active: true },
    { key: 'joints', icon: Crosshair, label: 'المفاصل', active: showSkeleton },
  ];

  // Mock skeleton joints for visualization
  const skeletonJoints = [
    { id: 'head', x: 48, y: 25, size: 12, type: 'major' },
    { id: 'neck', x: 48, y: 35, size: 8, type: 'minor' },
    { id: 'torso', x: 48, y: 50, size: 16, type: 'major' },
    { id: 'pelvis', x: 48, y: 65, size: 12, type: 'major' },
    { id: 'right_shoulder', x: 35, y: 40, size: 10, type: 'major' },
    { id: 'right_elbow', x: 30, y: 50, size: 8, type: 'minor' },
    { id: 'right_hand', x: 25, y: 60, size: 8, type: 'minor' },
    { id: 'left_shoulder', x: 62, y: 40, size: 10, type: 'major' },
    { id: 'left_elbow', x: 67, y: 50, size: 8, type: 'minor' },
    { id: 'left_hand', x: 72, y: 60, size: 8, type: 'minor' },
    { id: 'right_hip', x: 43, y: 65, size: 10, type: 'major' },
    { id: 'right_knee', x: 41, y: 80, size: 8, type: 'minor' },
    { id: 'right_foot', x: 39, y: 95, size: 8, type: 'minor' },
    { id: 'left_hip', x: 53, y: 65, size: 10, type: 'major' },
    { id: 'left_knee', x: 55, y: 80, size: 8, type: 'minor' },
    { id: 'left_foot', x: 57, y: 95, size: 8, type: 'minor' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw character placeholder
    if (character) {
      // Draw character silhouette
      ctx.fillStyle = '#4ade80';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(200, 100, 200, 300);
      ctx.globalAlpha = 1;
    }

    // Draw skeleton overlay
    if (showSkeleton && characterParts) {
      skeletonJoints.forEach(joint => {
        const x = (joint.x / 100) * canvas.width;
        const y = (joint.y / 100) * canvas.height;
        const size = joint.size * (zoom / 100);

        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = joint.type === 'major' ? '#ff9800' : '#ffa726';
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff9800';
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw connections between joints
      const connections = [
        ['head', 'neck'], ['neck', 'torso'], ['torso', 'pelvis'],
        ['torso', 'right_shoulder'], ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_hand'],
        ['torso', 'left_shoulder'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_hand'],
        ['pelvis', 'right_hip'], ['right_hip', 'right_knee'], ['right_knee', 'right_foot'],
        ['pelvis', 'left_hip'], ['left_hip', 'left_knee'], ['left_knee', 'left_foot'],
      ];

      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;

      connections.forEach(([from, to]) => {
        const fromJoint = skeletonJoints.find(j => j.id === from);
        const toJoint = skeletonJoints.find(j => j.id === to);
        
        if (fromJoint && toJoint) {
          const x1 = (fromJoint.x / 100) * canvas.width;
          const y1 = (fromJoint.y / 100) * canvas.height;
          const x2 = (toJoint.x / 100) * canvas.width;
          const y2 = (toJoint.y / 100) * canvas.height;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
    }
  }, [character, characterParts, showSkeleton, zoom, frame]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="bg-dark-secondary panel-border h-12 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex space-x-2 space-x-reverse">
            {toolbarButtons.map((tool) => (
              <Button
                key={tool.key}
                variant={selectedTool === tool.key ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${
                  selectedTool === tool.key 
                    ? 'bg-accent-blue hover:bg-blue-600' 
                    : 'bg-dark-tertiary hover:bg-accent-blue'
                }`}
                onClick={() => setSelectedTool(tool.key as any)}
              >
                <tool.icon size={14} />
              </Button>
            ))}
          </div>
          <div className="h-6 w-px bg-dark-tertiary"></div>
          <div className="flex space-x-2 space-x-reverse">
            {skeletonButtons.map((button) => (
              <Button
                key={button.key}
                variant={button.active ? "default" : "outline"}
                size="sm"
                className={`w-8 h-8 p-0 ${
                  button.active 
                    ? 'bg-accent-green hover:bg-green-600' 
                    : 'bg-dark-tertiary hover:bg-accent-green'
                }`}
                onClick={() => {
                  if (button.key === 'joints') {
                    setShowSkeleton(!showSkeleton);
                  }
                }}
              >
                <button.icon size={14} />
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse text-sm text-text-primary">
          <span>التكبير: {zoom}%</span>
          <div className="h-4 w-px bg-dark-tertiary"></div>
          <span>الإطار: {frame} / 30</span>
          <div className="h-4 w-px bg-dark-tertiary"></div>
          <span className="text-accent-green">
            {showSkeleton ? "الهيكل العظمي نشط" : "الهيكل العظمي مخفي"}
          </span>
        </div>
      </div>

      {/* Character Viewport */}
      <div className="flex-1 character-viewport relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ cursor: selectedTool === 'pan' ? 'grab' : 'crosshair' }}
        />
        
        {!character && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-text-secondary">
              <Box className="mx-auto mb-4" size={48} />
              <h3 className="text-lg font-medium mb-2">لا توجد شخصية محددة</h3>
              <p className="text-sm">قم بتحميل صورة شخصية من الشريط الجانبي لبدء التحليل</p>
            </div>
          </div>
        )}
        
        {/* Viewport controls */}
        <div className="absolute top-4 right-4">
          <div className="bg-dark-secondary rounded-lg p-2 space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-8 h-8 p-0 bg-dark-tertiary hover:bg-accent-blue"
            >
              <Box size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-8 h-8 p-0 bg-dark-tertiary hover:bg-accent-blue"
            >
              <Maximize size={14} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-8 h-8 p-0 bg-dark-tertiary hover:bg-accent-blue"
              onClick={() => setZoom(100)}
            >
              <RotateCcw size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
