'use client';

import { useState } from 'react';
import { authService } from '@/services/api';

export default function TestMobileFormatPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testLoginWithPlus = async () => {
    setLoading(true);
    setResult('Testing login with + prefix...');
    try {
      // Test with Admin A credentials (with + prefix)
      const response = await authService.login('+1234567890', 'admin123');
      setResult(`Success! User: ${response.user.name}, Mobile: ${response.user.mobileNumber}`);
    } catch (error: any) {
      console.error('Login test error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testLoginWithoutPlus = async () => {
    setLoading(true);
    setResult('Testing login without + prefix...');
    try {
      // Test with Admin A credentials (without + prefix)
      const response = await authService.login('1234567890', 'admin123');
      setResult(`Success! User: ${response.user.name}, Mobile: ${response.user.mobileNumber}`);
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
      <h1>Mobile Number Format Test</h1>
      <p>This page tests the login functionality with different mobile number formats.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testLoginWithPlus} 
          disabled={loading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Test with +1234567890
        </button>
        <button 
          onClick={testLoginWithoutPlus} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          Test with 1234567890
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