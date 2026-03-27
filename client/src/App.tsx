// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { TestParametersForm } from './components/TestParametersForm';
import { BlueprintReview } from './components/BlueprintReview';
import { DocumentLayoutSidebar } from './components/layout/DocumentLayoutSidebar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); 
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

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
      
      <header className="mb-6 text-center w-full max-w-7xl px-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Test Generator <span className="text-blue-600">Pro</span>
        </h1>
        {isAuthenticated && (
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        )}
      </header>

      <main className="w-full max-w-7xl px-4">
        {!isAuthenticated ? (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-xl mb-4 text-center font-semibold text-gray-700">Sign In</h2>
            <Login onAuthSuccess={() => setIsAuthenticated(true)} />
          </div>
        ) : (
          /* NEW: Flex container to hold the Sidebar and Main Content side-by-side */
          <div className="flex flex-col md:flex-row gap-8 items-start w-full">
            
            {/* Left Column: The Sticky Sidebar */}
            <div className="w-full md:w-72 flex-shrink-0 sticky top-6 h-[calc(100vh-6rem)]">
              <DocumentLayoutSidebar />
            </div>

            {/* Right Column: The Main Scrolling Content Area */}
            <div className="flex-1 space-y-8 pb-20 w-full min-w-0">
              <div className="w-full">
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