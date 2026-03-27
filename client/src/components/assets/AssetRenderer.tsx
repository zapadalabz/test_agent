// src/components/assets/AssetRenderer.tsx
import React from 'react';
import { PlotRenderer } from './PlotRenderer';
import { ImageEditor } from './ImageEditor';

export const AssetRenderer: React.FC<{ assets: any[] }> = ({ assets }) => {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full my-4 space-y-4">
      {assets.map((asset, idx) => {
        if (asset.type === 'image') {
          return <ImageEditor key={idx} imageData={asset.image_data} generatedPrompt={asset.generated_prompt} />;
        }
        if (asset.type === 'plot') {
          return <PlotRenderer key={idx} plotData={asset.plot_data} />;
        }
        if (asset.type === 'table') {
          // Simple table render using dangerouslySetInnerHTML since it's markdown/HTML string from LLM
          return (
            <div key={idx} className="overflow-x-auto w-full max-w-2xl my-4">
              <div dangerouslySetInnerHTML={{ __html: asset.table_data }} className="prose prose-sm border rounded p-4 bg-white" />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};