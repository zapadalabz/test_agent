// src/components/Login.tsx
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

interface LoginProps {
  onAuthSuccess: () => void;
}

export const Login = ({ onAuthSuccess }: LoginProps) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      // 1. Send the token to your backend using the env variable
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
        credentials: 'include', // Crucial for receiving the HttpOnly cookie
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Successfully authenticated with backend!', data.user);
        // Trigger the state update in App.tsx
        onAuthSuccess();
      } else {
        console.error('Backend authentication failed:', data.message);
      }
    } catch (error) {
      console.error('Network error during authentication:', error);
    }
  };

  const handleError = () => {
    console.error('Google Login Popup Failed');
  };

  return (
    <div className="flex justify-center p-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
      />
    </div>
  );
};