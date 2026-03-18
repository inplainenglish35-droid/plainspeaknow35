import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, Image, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploaderProps {
  onTextExtracted: (text: string) => void;
  onImageUpload: (base64: string, mimeType: string) => Promise<string>;
  isProcessing: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploader: React.FC<FileUploaderProps> = ({
  onTextExtracted,
  onImageUpload,
  isProcessing,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processing = isProcessing || localProcessing;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setLocalProcessing(true);

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit. Please use a smaller file.');
      }

      const fileType = file.type;
      setUploadedFile(file.name);

      // Handle text files
      if (fileType === 'text/plain') {
        const text = await file.text();
        onTextExtracted(text);
        return;
      }

      // Handle images (OCR)
      if (fileType.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file);
          const extractedText = await onImageUpload(base64, fileType);
          onTextExtracted(extractedText);
        } catch (ocrError) {
          // Re-throw with the actual error message from the OCR service
          const errorMessage = ocrError instanceof Error 
            ? ocrError.message 
            : 'Failed to extract text from image. Please try again.';
          throw new Error(errorMessage);
        }
        return;
      }

      // Handle PDF and DOCX - show helpful error
      if (fileType === 'application/pdf' || 
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        throw new Error('PDF and Word documents are not supported. Please copy and paste the text, or upload a screenshot image instead.');
      }

      throw new Error('Unsupported file type. Please upload a TXT file or an image (JPG, PNG, WebP, GIF).');
    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file. Please try again.');
      setUploadedFile(null);
    } finally {
      setLocalProcessing(false);
    }
  }, [onTextExtracted, onImageUpload]);


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.jpg,.jpeg,.png,.webp,.gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload file"
      />
      
      <div
        onClick={!processing ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Drop zone for file upload"
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
          isDragging
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
          processing && 'pointer-events-none opacity-70'
        )}
      >
        {processing ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Processing file...
            </p>
          </div>
        ) : uploadedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                {uploadedFile}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center gap-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <Image className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports TXT and images: JPG, PNG, WebP, GIF (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
