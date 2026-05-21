// client/src/components/ManualJSONImport.tsx
import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 1. Add the prop interface
interface ManualJSONImportProps {
  onImportSuccess: (question: any) => void;
}

export const ManualJSONImport: React.FC<ManualJSONImportProps> = ({ onImportSuccess }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleImport = async () => {
    setStatus({ type: 'loading', message: 'Importing...' });

    // Automatically clean up common AI markdown escapes!
    const cleanedInput = jsonInput
      .replace(/\\_/g, '_')    // Removes backslashes before underscores
      .replace(/\\\[/g, '[')   // Removes backslashes before left brackets
      .replace(/\\\]/g, ']');  // Removes backslashes before right brackets
    
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(cleanedInput);
    } catch (err) {
      setStatus({ type: 'error', message: 'Invalid JSON format. Please check for missing brackets or quotes.' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/generate/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(parsedJSON)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Import failed');

      setStatus({ type: 'success', message: 'Question imported and saved successfully!' });
      setJsonInput(''); 

      // 2. Pass the saved question up to the parent!
      onImportSuccess(data.question);

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8 w-full">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Manual JSON Import</h3>
      <p className="text-sm text-gray-500 mb-4">
        Generated a perfect question in the Google Drive chat? Paste the raw JSON here to inject it directly into your test layout.
      </p>
      
      <textarea
        className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm shadow-inner focus:ring-blue-500 focus:border-blue-500"
        placeholder='{ "Question_Type": "MCQ", "Stem": ... }'
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
      />
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex-1 pr-4">
          {status.type === 'error' && <p className="text-sm font-bold text-red-600">{status.message}</p>}
          {status.type === 'success' && <p className="text-sm font-bold text-green-600">{status.message}</p>}
        </div>
        <button
          onClick={handleImport}
          disabled={!jsonInput.trim() || status.type === 'loading'}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50 transition-colors"
        >
          {status.type === 'loading' ? 'Saving...' : 'Import Question'}
        </button>
      </div>
    </div>
  );
};