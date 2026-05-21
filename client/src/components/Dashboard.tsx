import React, { useEffect, useState } from 'react';
import { useTestContext } from '../context/TestContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Dashboard = ({ onTestLoaded }: { onTestLoaded: () => void }) => {
  const [tests, setTests] = useState<any[]>([]);
  const { setTestMetadata, setActiveVersionId, setLayout, setGeneratedQuestions } = useTestContext();

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
      setGeneratedQuestions(data.generatedQuestions || []);
      
      onTestLoaded();
    } catch (err) {
      console.error("Failed to load test data", err);
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
            <span className="text-sm text-gray-400">
              {new Date(test.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {tests.length === 0 && <p className="text-gray-500 italic">No saved tests found.</p>}
      </div>
    </div>
  );
};