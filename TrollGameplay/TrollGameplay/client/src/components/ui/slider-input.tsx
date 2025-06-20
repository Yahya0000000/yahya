import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  displayValue,
  leftLabel,
  rightLabel,
  className
}: SliderInputProps) {
  return (
    <div className={className}>
      <Label className="text-sm text-text-secondary mb-2 block">{label}</Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => onChange(values[0])}
        className="w-full mb-1"
      />
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{leftLabel || min}</span>
        {displayValue && (
          <span className="font-medium text-text-primary">{displayValue}</span>
        )}
        <span>{rightLabel || max}</span>
      </div>
    </div>
  );
}
