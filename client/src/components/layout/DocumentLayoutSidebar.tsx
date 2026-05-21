// src/components/layout/DocumentLayoutSidebar.tsx
import React, { useState } from 'react';
import { useTestContext, type LayoutItem } from '../../context/TestContext';

export const DocumentLayoutSidebar = () => {
  const { layout, setLayout } = useTestContext();
  const [showAssetManager, setShowAssetManager] = useState(false);

  // Helper to generate a random ID for UI keys
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const addBlankPage = () => {
    setLayout(prev => [...prev, {
      id: generateId(),
      itemType: 'BlankPage',
      title: 'Blank Page'
    }]);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...layout];
    if (direction === 'up' && index > 0) {
      [newLayout[index - 1], newLayout[index]] = [newLayout[index], newLayout[index - 1]];
    } else if (direction === 'down' && index < newLayout.length - 1) {
      [newLayout[index + 1], newLayout[index]] = [newLayout[index], newLayout[index + 1]];
    }
    setLayout(newLayout);
  };

  const removeItem = (index: number) => {
    setLayout(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Document Layout</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {layout.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center mt-4">Generate questions to see layout.</p>
        ) : (
          layout.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-md group hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  item.itemType === 'Question' ? 'bg-blue-500' : 
                  item.itemType === 'StaticAsset' ? 'bg-orange-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-700">{item.title}</span>
              </div>
              
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">↑</button>
                <button onClick={() => moveItem(idx, 'down')} disabled={idx === layout.length - 1} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">↓</button>
                <button onClick={() => removeItem(idx)} className="p-1 ml-1 text-gray-400 hover:text-red-600">×</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t bg-gray-50 space-y-2">
        <button 
          onClick={() => setShowAssetManager(true)}
          className="w-full text-sm bg-orange-100 text-orange-700 font-semibold py-2 rounded hover:bg-orange-200"
        >
          + Insert PDF Asset
        </button>
        <button 
          onClick={addBlankPage}
          className="w-full text-sm bg-gray-200 text-gray-700 font-semibold py-2 rounded hover:bg-gray-300"
        >
          + Insert Blank Page
        </button>
      </div>

      {/* Placeholder for the Asset Manager Modal */}
      {showAssetManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
              <h3 className="text-lg font-bold mb-4">Select PDF Asset</h3>
              <p className="text-sm text-gray-600 mb-6">Select a Cover Page or Formula Sheet to insert into your document flow.</p>
              
              <div className="space-y-2 mb-6">
                <button 
                  onClick={() => {
                    setLayout(prev => [...prev, { id: generateId(), itemType: 'StaticAsset', title: 'IB Biology Data Booklet' }]);
                    setShowAssetManager(false);
                  }}
                  className="w-full text-left p-3 border rounded hover:bg-orange-50 flex justify-between items-center"
                >
                  <span className="font-medium">IB Biology Data Booklet</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">Shared</span>
                </button>
                <button 
                  onClick={() => {
                    setLayout(prev => [...prev, { id: generateId(), itemType: 'StaticAsset', title: 'Standard Cover Page' }]);
                    setShowAssetManager(false);
                  }}
                  className="w-full text-left p-3 border rounded hover:bg-orange-50 flex justify-between items-center"
                >
                  <span className="font-medium">Standard Cover Page</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">Shared</span>
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAssetManager(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};