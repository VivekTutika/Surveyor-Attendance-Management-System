'use client';

import { useState } from 'react';
import { authService } from '@/services/api';

export default function TestLoginFixPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    try {
      // Test with Admin A credentials
      const response = await authService.login('+1234567890', 'admin123');
      setResult(`Success! User: ${response.user.name}, Role: ${response.user.role}`);
    } catch (error: any) {
      console.error('Login test error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Login Fix Test</h1>
      <p>This page tests the login functionality to verify our fixes.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testLogin} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          Test Admin Login
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap'
      }}>
        <strong>Result:</strong>
        <div>{result}</div>
      </div>
    </div>
  );
}