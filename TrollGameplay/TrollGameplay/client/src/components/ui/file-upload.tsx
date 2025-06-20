import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  children?: React.ReactNode;
  multiple?: boolean;
}

export default function FileUpload({
  onFileSelect,
  acceptedTypes = [],
  maxSize = 10 * 1024 * 1024, // 10MB default
  children,
  multiple = false
}: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`الملف كبير جداً. الحد الأقصى ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('نوع الملف غير مدعوم');
      } else {
        setError('خطأ في تحميل الملف');
      }
      setUploadStatus('error');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadStatus('uploading');
      
      try {
        onFileSelect(file);
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 2000);
      } catch (err) {
        setError('فشل في تحميل الملف');
        setUploadStatus('error');
      }
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple
  });

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <div className="animate-spin w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-accent-green" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Upload className="w-6 h-6 text-text-secondary" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'جاري التحميل...';
      case 'success':
        return 'تم التحميل بنجاح!';
      case 'error':
        return error || 'خطأ في التحميل';
      default:
        return isDragActive ? 'اتركه هنا...' : 'اسحب الملف هنا أو انقر للتحديد';
    }
  };

  if (children) {
    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {children}
        {error && (
          <div className="mt-2 text-sm text-red-500 flex items-center">
            <AlertCircle className="w-4 h-4 ml-1" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
        ${isDragActive 
          ? 'border-accent-blue bg-accent-blue/10' 
          : uploadStatus === 'error'
          ? 'border-red-500 bg-red-500/10'
          : uploadStatus === 'success'
          ? 'border-accent-green bg-accent-green/10'
          : 'border-dark-tertiary hover:border-accent-blue'
        }
      `}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-2">
        {getStatusIcon()}
        <p className="text-sm text-text-primary">{getStatusText()}</p>
        {acceptedTypes.length > 0 && uploadStatus === 'idle' && (
          <p className="text-xs text-text-secondary">
            {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
