import React, { useEffect, useState } from 'react';
import { useTestContext } from '../context/TestContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Dashboard = ({ onTestLoaded }: { onTestLoaded: () => void }) => {
  const [tests, setTests] = useState<any[]>([]);
  const { setTestMetadata, setActiveVersionId, setLayout, setBlueprint, setGeneratedQuestions } = useTestContext();

  useEffect(() => {
    fetch(`${API_URL}/api/tests`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(err => console.error("Failed to load tests", err));
  }, []);

  const handleLoadTest = async (testId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/tests/${testId}`, { credentials: 'include' });
      const data = await res.json();
      
      setTestMetadata(data.test);
      setActiveVersionId(data.version._id);
      setLayout(data.version.layout || []);
      setBlueprint(data.version.blueprint || []); // Populate restored Blueprint
      setGeneratedQuestions(data.generatedQuestions || []);
      
      onTestLoaded();
    } catch (err) {
      console.error("Failed to load test data", err);
    }
  };

  const handleDeleteTest = async (e: React.MouseEvent, testId: string) => {
    e.stopPropagation(); // Stop click from triggering 'handleLoadTest'
    if (!confirm('Are you sure you want to permanently delete this test?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/tests/${testId}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) {
        setTests(prev => prev.filter(t => t._id !== testId));
      } else {
        alert('Failed to delete test');
      }
    } catch (err) {
      console.error("Failed to delete test", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Saved Tests</h2>
      <div className="grid gap-4">
        {tests.map(test => (
          <div key={test._id} className="p-4 border rounded hover:bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => handleLoadTest(test._id)}>
            <div>
              <h3 className="font-bold text-lg text-blue-600">{test.title}</h3>
              <p className="text-sm text-gray-500">{test.subject} • {test.gradeLevel}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {new Date(test.createdAt).toLocaleDateString()}
              </span>
              <button 
                onClick={(e) => handleDeleteTest(e, test._id)}
                className="text-red-500 hover:bg-red-100 hover:text-red-700 px-3 py-1 rounded text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {tests.length === 0 && <p className="text-gray-500 italic">No saved tests found.</p>}
      </div>
    </div>
  );
};