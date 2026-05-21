// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { TestParametersForm } from './components/TestParametersForm';
import { BlueprintReview } from './components/BlueprintReview';
import { DocumentLayoutSidebar } from './components/layout/DocumentLayoutSidebar';
import { Dashboard } from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); 
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Simple view routing state
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [API_URL]);

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading your session...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6">
      
      <header className="mb-6 text-center w-full max-w-7xl px-4 flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Test Generator <span className="text-blue-600">Pro</span>
        </h1>
        <div className="flex gap-4">
          {isAuthenticated && currentView === 'editor' && (
            <button onClick={() => setCurrentView('dashboard')} className="text-sm font-semibold text-gray-500 hover:text-blue-600">
              Back to Dashboard
            </button>
          )}
          {isAuthenticated && (
            <button onClick={() => setIsAuthenticated(false)} className="text-sm font-semibold text-gray-500 hover:text-red-600">
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="w-full max-w-7xl px-4">
        {!isAuthenticated ? (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-xl mb-4 text-center font-semibold text-gray-700">Sign In</h2>
            <Login onAuthSuccess={() => setIsAuthenticated(true)} />
          </div>
        ) : currentView === 'dashboard' ? (
          <div className="w-full">
            <div className="flex justify-end mb-4">
               <button onClick={() => setCurrentView('editor')} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">
                 + Create New Test
               </button>
            </div>
            <Dashboard onTestLoaded={() => setCurrentView('editor')} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start w-full print:block">
            <div className="w-full md:w-72 flex-shrink-0 sticky top-6 h-[calc(100vh-6rem)] print:hidden">
              <DocumentLayoutSidebar />
            </div>

            <div className="flex-1 space-y-8 pb-20 w-full min-w-0 print:m-0 print:p-0">
              <div className="w-full print:hidden">
                <TestParametersForm />
              </div>
              <div className="w-full">
                <BlueprintReview />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;