// src/components/assets/ImageEditor.tsx
import React, { useState } from 'react';

interface ImageProps {
  imageData: string | null;
  generatedPrompt?: string;
  onOverrideImage?: (file: File) => void;
}

export const ImageEditor: React.FC<ImageProps> = ({ imageData, generatedPrompt, onOverrideImage }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onOverrideImage) {
      onOverrideImage(e.target.files[0]);
    }
  };

  // If we have a valid URL (Cloudinary or Placeholder)
  if (imageData && imageData.startsWith('http')) {
    return (
      <div 
        className="relative inline-block my-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={imageData} alt="Question Asset" className="max-w-md border rounded shadow-sm" />
        
        {/* Manual Override UI */}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded">
            <label className="bg-white text-gray-800 px-4 py-2 rounded font-bold cursor-pointer hover:bg-gray-100">
              Upload Manual Override
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {generatedPrompt && (
              <p className="text-white text-xs mt-2 px-4 text-center">Prompt: {generatedPrompt}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Loading / Generating State
  return (
    <div className="w-full max-w-md mx-auto my-4 bg-gray-100 p-8 border border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center text-center">
      <div className="animate-pulse mb-3">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      </div>
      <p className="text-sm font-bold text-gray-600">Generating Scientific Diagram...</p>
      {generatedPrompt && (
        <p className="text-xs text-gray-500 mt-2 italic">"{generatedPrompt}"</p>
      )}
      <label className="mt-4 text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300">
        Skip & Upload Manual
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
};