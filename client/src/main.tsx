// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'katex/dist/katex.min.css';
import './index.css';
import App from './App.tsx';
import { TestProvider } from './context/TestContext.tsx';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <TestProvider>
        <App/>
      </TestProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);