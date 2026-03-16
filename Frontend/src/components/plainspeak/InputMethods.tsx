import { useState } from "react";

interface InputMethodsProps {
  onFileSelected: (file: File) => void;
  onPaste?: () => void;
}

export function InputMethods({
  onFileSelected,
  onPaste,
}: InputMethodsProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // If it's an image, preview first
    if (file.type.startsWith("image/")) {
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      onFileSelected(file);
    }

    e.target.value = "";
  };

  const handleConfirm = () => {
    if (previewFile) {
      onFileSelected(previewFile);
      setPreviewFile(null);
      setPreviewUrl(null);
    }
  };

  const handleRetake = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col gap-3 text-sm">

      {/* Buttons Row */}
      <div className="flex gap-3 items-center">

        <button
          type="button"
          onClick={onPaste}
          className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
        >
          Paste text
        </button>

        <label className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 cursor-pointer">
          Upload file
          <input
            type="file"
            accept=".txt,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <label className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 cursor-pointer">
          Take photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Preview Section */}
      {previewUrl && (
        <div className="flex flex-col gap-2 mt-3 border border-slate-200 p-3 rounded-md bg-slate-50">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 object-contain rounded-md border"
          />

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="rounded-md bg-blue-600 text-white px-3 py-1 hover:bg-blue-700"
            >
              Use this photo
            </button>

            <button
              onClick={handleRetake}
              className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
            >
              Retake photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}







