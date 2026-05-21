// src/components/StructuredQuestionRenderer.tsx
import React from 'react';
import { AssetRenderer } from './assets/AssetRenderer';
import Latex from 'react-latex-next';

interface StructuredProps {
  questionNumber: number;
  questionData: any;
}

export const StructuredQuestionRenderer: React.FC<StructuredProps> = ({ questionNumber, questionData }) => {
  const { Stem, Parts, Markscheme } = questionData;

  // Helper to find the markscheme points for a specific part
  const getMarkschemeForPart = (partLabel: string) => {
    const scheme = Markscheme.find((m: any) => m.part_label === partLabel);
    return scheme ? scheme.points : [];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-gray-800">Question {questionNumber}</h3>
        <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-1 rounded">
          Structured Question
        </span>
      </div>

      {/* Main Stem */}
      <div className="mb-6 text-gray-800 text-base leading-relaxed font-medium">
        <Latex>{Stem.text}</Latex>
        {/* Assets */}
        {Stem.assets && Stem.assets.length > 0 && (
          <div className="my-3 p-3 bg-gray-50 border border-dashed border-gray-300 text-center text-sm text-gray-500">
            <AssetRenderer assets={Stem.assets} />
          </div>
        )}
      </div>

      {/* Parts List */}
      <div className="space-y-8">
        {Parts.map((part: any, idx: number) => (
          <div key={idx} className="pl-4 border-l-2 border-gray-200">
            {/* Part Text & Marks */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start flex-1 pr-4">
                <span className="font-bold mr-3 text-gray-700">({part.part_label})</span>
                <span className="text-gray-800">
                  <span className="font-semibold mr-1">{part.command_term}</span>
                  <Latex>{part.text}</Latex>
                </span>
              </div>
              <span className="font-bold text-gray-500 whitespace-nowrap">
                [{part.marks} mark{part.marks > 1 ? 's' : ''}]
              </span>
            </div>

            {/* Part Assets */}
            {part.assets && part.assets.length > 0 && (
              <div className="ml-8 my-2 p-3 bg-gray-50 border border-dashed border-gray-300 text-center text-sm text-gray-500">
                <AssetRenderer assets={part.assets} />
              </div>
            )}

            {/* Teacher Markscheme for this Part */}
            <div className="ml-8 mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <span className="font-bold text-green-800 text-sm block mb-2 border-b border-green-200 pb-1">Markscheme:</span>
              <ul className="list-disc pl-5 space-y-1">
                {getMarkschemeForPart(part.part_label).map((point: any, pIdx: number) => (
                  <li key={pIdx} className="text-sm">
                    <span className="text-green-900"><Latex>{point.text}</Latex></span>
                    <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${
                      point.point_type === 'Mandatory' ? 'bg-green-200 text-green-800' :
                      point.point_type === 'Alternative (OWTTE)' ? 'bg-blue-200 text-blue-800' :
                      'bg-red-200 text-red-800' // For DNA (Do Not Accept)
                    }`}>
                      {point.point_type === 'Alternative (OWTTE)' ? 'OWTTE' : point.point_type === 'Do Not Accept (DNA)' ? 'DNA' : 'Mandatory'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};