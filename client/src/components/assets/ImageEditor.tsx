// client/src/components/assets/ImageEditor.tsx
import React, { useState } from 'react';

interface ImageProps {
  imageData: string | null;
  generatedPrompt?: string;
  onOverrideImage?: (file: File) => void;
}

export const ImageEditor: React.FC<ImageProps> = ({ imageData, generatedPrompt, onOverrideImage }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onOverrideImage) {
      onOverrideImage(e.target.files[0]);
    }
  };

  const handleCopyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt).then(() => {
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2000);
      });
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
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded p-4">
            <label className="bg-white text-gray-800 px-4 py-2 rounded font-bold cursor-pointer hover:bg-gray-100 mb-4">
              Upload Manual Override
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            
            {generatedPrompt && (
              <div className="flex flex-col items-center w-full">
                <p className="text-white text-xs text-center line-clamp-3 mb-2">Prompt: {generatedPrompt}</p>
                <button 
                  onClick={handleCopyPrompt}
                  title="Copy image generation prompt"
                  aria-label="Copy image generation prompt to clipboard"
                  className={`p-2 rounded inline-flex items-center justify-center transition-colors ${
                    promptCopied ? 'bg-green-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  {promptCopied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  )}
                </button>
              </div>
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
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-600">Generating Scientific Diagram...</p>
      
      {generatedPrompt && (
        <div className="mt-3 flex flex-col items-center">
          <p className="text-xs text-gray-500 italic mb-2">"{generatedPrompt}"</p>
          <button 
            onClick={handleCopyPrompt}
            title="Copy image generation prompt"
            aria-label="Copy image generation prompt to clipboard"
            className={`p-1.5 rounded inline-flex items-center justify-center transition-colors ${
              promptCopied ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {promptCopied ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>
        </div>
      )}

      <label className="mt-4 text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-300">
        Skip & Upload Manual
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
};