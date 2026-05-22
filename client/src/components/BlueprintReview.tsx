// src/components/BlueprintReview.tsx
import React, { useState } from 'react';
import { useTestContext, type LayoutItem } from '../context/TestContext';
import { MCQRenderer } from './MCQRenderer';
import { StructuredQuestionRenderer } from './StructuredQuestionRenderer';
import { ManualJSONImport } from './ManualJSONImport';
import { generateLatex } from '../utils/latexExport';
import JSZip from 'jszip';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface GenerationStatus {
  status: 'idle' | 'generating' | 'complete' | 'error';
  message: string;
  progressText: string;
  generatedQuestions: any[];
}

export const BlueprintReview = () => {
  const { blueprint, budgetMismatch, setBlueprint, layout, setLayout, activeVersionId, testMetadata, viewMode, setViewMode, generatedQuestions, setGeneratedQuestions } = useTestContext();
  const [genState, setGenState] = useState<{status: string, message: string, progressText: string}>({
    status: 'idle', message: '', progressText: ''
  });

  const [copiedRowId, setCopiedRowId] = useState<number | null>(null);

  const handleCopyPrompt = (item: any, idx: number) => {
    const isMCQ = item.Question_Type === 'MCQ';
    const schemaFile = isMCQ ? 'mcq.schema.ts' : 'structured-question.schema.ts';
    const promptFunc = isMCQ ? 'getMCQPrompt' : 'getStructuredPrompt';

    const promptText = `**Task:** Generate a ${item.marks}-mark ${item.Question_Type.replace('_', ' ')} about ${item.topic}.

      **References & Style:**
      1. Use the BASE_CONTEXT and ${promptFunc} logic from the prompts.ts file. 
      2. Analyze the 'Past Papers' folder to match the exact difficulty, tone, and formatting of official IB physics questions.

      **Strict Output Rules:**
      1. Schema Match: Output the result strictly matching the JSON schema defined in ${schemaFile}.
      2. Command Terms: You MUST ONLY use the allowed command terms from the schema.
      3. Format: Output the response entirely inside a single \`\`\`json code block. Do not include conversational text.
      4. No Escaped Markdown: Output raw LaTeX (e.g., $v_{max}$). Do not escape underscores or brackets (NO \\_ or \\[).`;

      navigator.clipboard.writeText(promptText).then(() => {
        setCopiedRowId(idx);
        setTimeout(() => setCopiedRowId(null), 2000); // Reset after 2 seconds
      });
    };

  // Calculate the current total marks in the blueprint
  const totalMarks = blueprint.reduce((sum, item) => sum + item.marks, 0);

  // Save function:
  const saveTest = async () => {
    if (!testMetadata?._id || !activeVersionId) return alert('No active test to save.');
    
    try {
      const res = await fetch(`${API_URL}/api/tests/${testMetadata._id}/versions/${activeVersionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ layout })
      });
      if (res.ok) alert('Test saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Print function:
  const handlePrint = () => {
    window.print();
  };

  // Export to .tex function:
  const handleExportLatex = async () => {
    const title = testMetadata?.title || "Exam Draft";
    
    // 1. Initialize JSZip and an images folder
    const zip = new JSZip();
    const imageFolder = zip.folder("images");
    const imageMap = new Map<string, string>();
    let imageCounter = 1;

    setGenState(prev => ({ ...prev, status: 'generating', message: 'Bundling LaTeX and Images into ZIP...' }));

    // 2. Helper to fetch image blobs and map them for LaTeX
    const processAssets = async (assets: any[]) => {
      if (!assets || assets.length === 0) return;
      
      for (const asset of assets) {
        if (asset.type === 'image' && asset.image_data && asset.image_data.startsWith('http')) {
          // Prevent downloading the same image twice
          if (!imageMap.has(asset.image_data)) {
            try {
              const response = await fetch(asset.image_data);
              const blob = await response.blob();
              
              // Extract extension from mime type (default to png)
              const ext = blob.type.split('/')[1] || 'png';
              const filename = `image_${imageCounter++}.${ext}`;
              
              // Add to the "images" folder inside the zip
              imageFolder?.file(filename, blob);
              
              // Map the original URL to the relative local path for the LaTeX file
              imageMap.set(asset.image_data, `images/${filename}`);
            } catch (error) {
              console.error(`Failed to fetch image: ${asset.image_data}`, error);
            }
          }
        }
      }
    };

    try {
      // 3. Traverse the layout to find all images in questions and parts
      for (const item of layout) {
        if (item.itemType === 'Question') {
          const q = generatedQuestions.find(gq => gq._id === item.itemId);
          if (q) {
            // Process Main Stem Assets
            if (q.Stem && q.Stem.assets) {
              await processAssets(q.Stem.assets);
            }
            // Process Part Assets (for Structured Questions)
            if (q.Parts) {
              for (const part of q.Parts) {
                if (part.assets) {
                  await processAssets(part.assets);
                }
              }
            }
          }
        }
      }

      // 4. Generate the LaTeX string using the populated imageMap
      const latexString = generateLatex(layout, generatedQuestions, title, imageMap);
      
      // 5. Add the .tex file to the root of the ZIP
      zip.file(`${title.replace(/\s+/g, '_')}_Draft.tex`, latexString);

      // 6. Generate the ZIP blob and trigger the browser download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_LaTeX_Export.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setGenState(prev => ({ ...prev, status: 'complete', message: 'ZIP exported successfully!' }));
    } catch (error: any) {
      console.error('ZIP Export Error:', error);
      setGenState(prev => ({ ...prev, status: 'error', message: 'Failed to export ZIP.' }));
    }
  };

  const startGeneration = async () => {
    setGenState({ status: 'generating', message: 'Connecting to server...', progressText: '' });
    setGeneratedQuestions([]);

    try {
      const response = await fetch(`${API_URL}/api/generate/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ blueprint })
      });

      if (!response.body) throw new Error('ReadableStream not supported by the browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // Read the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // SSE messages are separated by double newlines
        const parts = buffer.split('\n\n');
        // Keep the last incomplete chunk in the buffer
        buffer = parts.pop() || ''; 

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            if (line.startsWith('data:')) eventData = line.slice(5).trim();
          }

          if (eventData) {
            const parsedData = JSON.parse(eventData);
            handleSSEEvent(eventType, parsedData);
          }
        }
      }
    } catch (error: any) {
      setGenState(prev => ({ ...prev, status: 'error', message: error.message || 'Stream failed.' }));
    }
  };

  // Handle the specific events emitted by your generate.routes.ts
  const handleSSEEvent = (event: string, data: any) => {
    switch (event) {
      case 'status':
      case 'warning':
        setGenState(prev => ({ ...prev, message: data.message }));
        break;
      case 'progress':
        setGenState(prev => ({ ...prev, progressText: data.message }));
        break;
      case 'question_ready':
        setGeneratedQuestions(prev => [...prev, data.question]);
        break;
      case 'image_processing_started':
      case 'image_prompt_ready':
      case 'image_generation_started':
      case 'image_upload_started':
      case 'image_ready':
        // For now, just log background asset events or show a toast
        console.log(`[Asset Update] ${event}:`, data);
        break;
      case 'complete':
        setGenState({ status: 'complete', message: 'Success!', progressText: '' });
        setGeneratedQuestions(data.results);

        // Auto-populate the layout sidebar!
        const initialLayout: LayoutItem[] = data.results.map((q: any, idx: number) => ({
          id: Math.random().toString(36).substring(2, 11),
          itemType: 'Question',
          itemId: q._id,
          itemModel: q.Question_Type === 'MCQ' ? 'MCQ' : 'StructuredQuestion',
          title: `Question ${idx + 1} (${q.Question_Type.replace('_', ' ')})`
        }));
        setLayout(initialLayout);

        break;
      case 'error':
        setGenState(prev => ({ ...prev, status: 'error', message: data.message }));
        break;
      default:
        console.log('Unknown event:', event, data);
    }
  };

  if (!blueprint || blueprint.length === 0) {
    return null; // Don't render if there's no blueprint yet
  }

  const handleManualImportSuccess = (newQuestion: any) => {
    // 1. Add to local state so the renderer can find the text, and flip status to 'complete' if it was idle
    setGenState(prev => ({
      ...prev,
      status: prev.status === 'idle' ? 'complete' : prev.status
    }));
    setGeneratedQuestions(prev => [...prev, newQuestion]);

    // 2. Add to sidebar layout
    setLayout(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 11),
      itemType: 'Question',
      itemId: newQuestion._id,
      itemModel: newQuestion.Question_Type === 'MCQ' ? 'MCQ' : 'StructuredQuestion',
      title: `Imported ${newQuestion.Question_Type === 'MCQ' ? 'MCQ' : 'FRQ'}`
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8 mb-12 print:shadow-none print:p-0 print:m-0">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Review Test Blueprint</h2>

        {budgetMismatch && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-bold mb-1">Mark Budget Mismatch Detected!</h3>
            <p className="text-red-700 text-sm">
              The AI generated a test worth <strong>{totalMarks} marks</strong>, which differs from your requested budget. 
              Please review the allocations below. You can proceed with generation, or generate a new blueprint.
            </p>
          </div>
        )}

        {/* Blueprint Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Style</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blueprint.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.question_number}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.topic}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.Question_Type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.Style}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">{item.marks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleCopyPrompt(item, idx)}
                      title="Copy AI prompt to clipboard"
                      aria-label="Copy AI prompt for this specific question to your clipboard"
                      className={`p-2 rounded inline-flex items-center justify-center transition-colors ${
                        copiedRowId === idx 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {copiedRowId === idx ? (
                        // Checkmark Icon
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        // Clipboard Icon
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right">Total Generated Marks:</td>
                <td className={`px-6 py-3 ${budgetMismatch ? 'text-red-600' : 'text-green-600'}`}>
                  {totalMarks}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Generation Controls & Status */}
        <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Generate Questions</h3>
              <p className="text-sm text-gray-500">This process will take a few moments. Do not refresh the page.</p>
            </div>
            <button
              onClick={startGeneration}
              disabled={genState.status === 'generating' || genState.status === 'complete'}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
            >
              {genState.status === 'generating' ? 'Generating...' : 'Start Generator'}
            </button>
          </div>

          {/* Live SSE Updates */}
          {genState.status !== 'idle' && (
            <div className="mt-4 p-4 bg-white border rounded shadow-inner">
              <p className="font-semibold text-blue-600">{genState.message}</p>
              {genState.progressText && <p className="text-sm text-gray-600 mt-1">{genState.progressText}</p>}
              
              <div className="mt-4">
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                  Questions Ready: {generatedQuestions.length} / {blueprint.length}
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(generatedQuestions.length / blueprint.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {genState.status === 'error' && (
            <p className="mt-4 text-red-600 font-bold">{genState.message}</p>
          )}
        </div>
        
        <ManualJSONImport onImportSuccess={handleManualImportSuccess}/>
      </div>

      {/* Render Generated Questions Once Complete */}
      {(genState.status === 'complete' || generatedQuestions.length > 0) && layout.length > 0 && (
        <div className="mt-12 border-t pt-8 w-full print:border-none print:mt-0 print:pt-0">
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-2xl font-bold text-gray-800">Generated Exam Draft</h2>
            
            <div className="flex gap-4 items-center">
              {/* View Toggle */}
              <div className="bg-gray-100 p-1 rounded flex">
                <button 
                  onClick={() => setViewMode('student')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'student' ? 'bg-white shadow font-bold' : 'text-gray-600'}`}
                >
                  Student View
                </button>
                <button 
                  onClick={() => setViewMode('teacher')}
                  className={`px-3 py-1 text-sm rounded ${viewMode === 'teacher' ? 'bg-white shadow font-bold' : 'text-gray-600'}`}
                >
                  Teacher View
                </button>
              </div>

              <button onClick={saveTest} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                Save Test
              </button>

              <button onClick={handleExportLatex} className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700">
                Export .tex
              </button>

              <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded font-bold hover:bg-gray-900">
                Export PDF
              </button>
            </div>
          </div>
          
          <div className="print-area space-y-6">
            {layout.map((item, index) => {
              
              // 1. Handle Questions
              if (item.itemType === 'Question') {
                // Look up the actual question data using the ID saved in the layout item
                const q = generatedQuestions.find(gq => gq._id === item.itemId);
                
                if (!q) return null; // Fallback if data is missing
                
                if (q.Question_Type === 'MCQ') {
                  return <MCQRenderer key={item.id} questionNumber={index + 1} questionData={q} />;
                } else if (q.Question_Type === 'Structured_Question') {
                  return <StructuredQuestionRenderer key={item.id} questionNumber={index + 1} questionData={q} />;
                }
              } 
              
              // 2. Handle Blank Pages
              else if (item.itemType === 'BlankPage') {
                return (
                  <div key={item.id} className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-48 shadow-sm page-break-after print:border-none print:h-screen">
                    <span className="text-gray-400 font-bold tracking-widest uppercase no-print">[ Blank Page ]</span>
                  </div>
                );
              } 
              
              // 3. Handle PDF Static Assets (Cover Pages, Formula Sheets)
              else if (item.itemType === 'StaticAsset') {
                return (
                  <div key={item.id} className="bg-orange-50 p-6 border border-orange-200 rounded-lg flex flex-col items-center justify-center h-48 shadow-sm">
                    <span className="text-orange-500 font-bold mb-2">PDF Asset Placeholder</span>
                    <span className="text-orange-800 font-semibold">{item.title}</span>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};