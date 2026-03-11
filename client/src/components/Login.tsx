// src/components/Login.tsx
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export const Login = () => {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      // 1. Send the token to your backend
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
        credentials: 'include', 
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Successfully authenticated with backend!', data.user);
        // You could update some global React context state here later
        // e.g., setIsAuthenticated(true) or setUser(data.user)
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