// src/App.tsx
import { Login } from './components/Login';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Test Generator Pro
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl mb-4 text-center">Sign In</h2>
        <Login />
      </div>
    </div>
  );
}

export default App;