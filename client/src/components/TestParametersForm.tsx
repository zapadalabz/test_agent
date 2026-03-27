// src/components/TestParametersForm.tsx
import React, { useState } from 'react';
import { useTestContext } from '../context/TestContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const TestParametersForm = () => {
  const { setTestMetadata, setActiveVersionId, setBlueprint, setBudgetMismatch } = useTestContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Biology',
    gradeLevel: 'HL',
    topics: '', // Will split by comma
    totalMarks: 50,
    mcqAllocation: 20,
    sfrAllocation: 20,
    dbqAllocation: 10
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Allocation') || name === 'totalMarks' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate Mark Budget
    const { totalMarks, mcqAllocation, sfrAllocation, dbqAllocation } = formData;
    if (mcqAllocation + sfrAllocation + dbqAllocation !== totalMarks) {
      setError('Allocations must equal the total mark budget.');
      setLoading(false);
      return;
    }

    try {
      // 1. Initialize Test in Database
      const testRes = await fetch(`${API_URL}/api/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          subject: formData.subject,
          gradeLevel: formData.gradeLevel
        })
      });
      
      if (!testRes.ok) throw new Error('Failed to create test document');
      const testData = await testRes.json();
      
      // Update Global State
      setTestMetadata(testData.test);
      setActiveVersionId(testData.version._id);

      // 2. Generate Blueprint from OpenAI
      const blueprintRes = await fetch(`${API_URL}/api/generate/blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topics: formData.topics.split(',').map(t => t.trim()),
          totalMarks,
          mcqAllocation,
          sfrAllocation,
          dbqAllocation
        })
      });

      if (!blueprintRes.ok) throw new Error('Failed to generate blueprint');
      const blueprintData = await blueprintRes.json();

      // Update Global State with Blueprint details
      setBlueprint(blueprintData.blueprint);
      setBudgetMismatch(blueprintData.budgetMismatch);

      // Note: Here you would typically trigger a router push to the next step (Blueprint Review)

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Test</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Meta Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Test Title</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <select name="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
            </select>
          </div>
        </div>

        {/* Blueprint Generation Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Topics (comma separated)</label>
          <input type="text" name="topics" required placeholder="e.g. Mitosis, Meiosis, DNA Replication" value={formData.topics} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>

        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Marks</label>
            <input type="number" name="totalMarks" required value={formData.totalMarks} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border font-bold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">MCQ Marks</label>
            <input type="number" name="mcqAllocation" required value={formData.mcqAllocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Standard FRQ</label>
            <input type="number" name="sfrAllocation" required value={formData.sfrAllocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data-Based (DBQ)</label>
            <input type="number" name="dbqAllocation" required value={formData.dbqAllocation} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? 'Generating Blueprint...' : 'Initialize Test & Generate Blueprint'}
        </button>
      </form>
    </div>
  );
};