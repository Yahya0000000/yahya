import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, Brain, Puzzle, Eye, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileUpload from "@/components/ui/file-upload";
import { useCharacterAnalysis } from "@/hooks/use-character-analysis";

interface CharacterAnalysisPanelProps {
  onCharacterSelect: (id: number | null) => void;
  selectedCharacterId: number | null;
}

export default function CharacterAnalysisPanel({ 
  onCharacterSelect, 
  selectedCharacterId 
}: CharacterAnalysisPanelProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { uploadCharacter, analysisProgress } = useCharacterAnalysis();

  const { data: characterParts } = useQuery({
    queryKey: [`/api/characters/${selectedCharacterId}/parts`],
    enabled: !!selectedCharacterId,
  });

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    try {
      const character = await uploadCharacter(file, "شخصية جديدة");
      onCharacterSelect(character.id);
    } catch (error) {
      console.error("Failed to upload character:", error);
    }
  };

  const analysisSteps = [
    { name: "كشف أجزاء الجسم", progress: 100, status: "completed" },
    { name: "تحليل العمق الثلاثي", progress: 100, status: "completed" },
    { name: "بناء الهيكل العظمي", progress: analysisProgress, status: analysisProgress === 100 ? "completed" : "processing" },
  ];

  return (
    <div className="w-80 bg-dark-secondary panel-border flex flex-col">
      {/* Import Section */}
      <div className="p-4 border-b border-dark-tertiary">
        <h3 className="font-semibold mb-3 flex items-center text-text-primary">
          <Upload className="ml-2 text-accent-blue" size={16} />
          استيراد الشخصية
        </h3>
        <FileUpload
          onFileSelect={handleFileUpload}
          acceptedTypes={["image/png", "image/jpeg", "image/jpg"]}
          maxSize={10 * 1024 * 1024} // 10MB
        >
          <div className="border-2 border-dashed border-dark-tertiary rounded-lg p-6 text-center hover:border-accent-blue transition-colors cursor-pointer">
            <FileImage className="mx-auto text-3xl text-text-secondary mb-2" size={32} />
            <p className="text-sm text-text-secondary">اسحب الصورة هنا أو انقر للتحديد</p>
            <p className="text-xs text-text-secondary mt-1">PNG, JPG, SVG</p>
          </div>
        </FileUpload>
      </div>

      {/* Analysis Progress */}
      <div className="p-4 border-b border-dark-tertiary">
        <h3 className="font-semibold mb-3 flex items-center text-text-primary">
          <Brain className="ml-2 text-accent-orange" size={16} />
          تحليل ذكي
        </h3>
        <div className="space-y-3">
          {analysisSteps.map((step, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text-primary">{step.name}</span>
                <span className={step.status === "completed" ? "text-accent-green" : "text-accent-orange"}>
                  {step.status === "completed" ? "مكتمل ✓" : `قيد المعالجة... ${step.progress}%`}
                </span>
              </div>
              <Progress value={step.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Character Parts List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3 flex items-center text-text-primary">
          <Puzzle className="ml-2 text-accent-blue" size={16} />
          أجزاء الشخصية
        </h3>
        <div className="space-y-2">
          {characterParts && characterParts.length > 0 ? (
            characterParts.map((part: any) => (
              <div 
                key={part.id}
                className="bg-dark-primary rounded p-3 hover:bg-dark-tertiary transition-colors cursor-pointer part-highlight"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Eye className="text-accent-green" size={14} />
                    <span className="text-sm font-medium text-text-primary">{part.name}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{Math.round(part.confidence * 100)}%</span>
                </div>
                <div className="mt-2 text-xs text-text-secondary">
                  <span>{part.joints?.length || 0} نقطة مفصلية</span> • 
                  <span> الطبقة {part.layer}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-text-secondary py-8">
              <Puzzle className="mx-auto mb-2" size={32} />
              <p className="text-sm">لم يتم تحميل شخصية بعد</p>
              <p className="text-xs mt-1">قم بتحميل صورة لبدء التحليل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
