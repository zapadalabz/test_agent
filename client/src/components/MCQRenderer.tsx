// src/components/MCQRenderer.tsx
import React from 'react';
import { AssetRenderer } from './assets/AssetRenderer';
import Latex from 'react-latex-next';

interface MCQProps {
  questionNumber: number;
  questionData: any; 
}

export const MCQRenderer: React.FC<MCQProps> = ({ questionNumber, questionData }) => {
  const { Stem, Options, Correct_Answer, Distractor_Rationale, AO_Level } = questionData;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-gray-800">Question {questionNumber}</h3>
        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
          MCQ • {AO_Level}
        </span>
      </div>

      {/* Stem */}
      <div className="mb-4 text-gray-800 text-base leading-relaxed">
        <Latex>{Stem.text}</Latex>
        {/* Assets */}
        {Stem.assets && Stem.assets.length > 0 && (
          <div className="my-3 p-3 bg-gray-50 border border-dashed border-gray-300 text-center text-sm text-gray-500">
            <AssetRenderer assets={Stem.assets} />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-6 ml-4">
        {Options.map((opt: any, idx: number) => (
          <div key={idx} className="flex items-start">
            <span className="font-bold mr-3 text-gray-700">{opt.label}.</span>
            <span className="text-gray-800"><Latex>{opt.text}</Latex></span>
          </div>
        ))}
      </div>

      {/* Teacher Markscheme / Rationale View */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-center mb-2">
          <span className="font-bold text-yellow-800 mr-2">Key:</span>
          <span className="font-extrabold text-lg text-green-700">{Correct_Answer}</span>
        </div>
        <div>
          <span className="font-bold text-yellow-800 text-sm block mb-1">Distractor Rationale:</span>
          <p className="text-sm text-yellow-900 italic"><Latex>{Distractor_Rationale}</Latex></p>
        </div>
      </div>
    </div>
  );
};