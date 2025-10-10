'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

export default function TestJWTPage() {
  const [tokenStatus, setTokenStatus] = useState<string>('');
  const [cookieInfo, setCookieInfo] = useState<string>('');

  const checkToken = () => {
    const token = Cookies.get('adminToken');
    if (token) {
      setTokenStatus(`Token found! Length: ${token.length}`);
      try {
        // Decode JWT payload (without verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCookieInfo(`Token payload: ${JSON.stringify(payload, null, 2)}\nExpires: ${new Date(payload.exp * 1000).toString()}`);
      } catch (e) {
        setCookieInfo('Error decoding token');
      }
    } else {
      setTokenStatus('No token found');
      setCookieInfo('');
    }
  };

  const clearToken = () => {
    Cookies.remove('adminToken');
    setTokenStatus('Token cleared');
    setCookieInfo('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JWT Token Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={checkToken} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Check Token
        </button>
        <button onClick={clearToken} style={{ padding: '10px 20px' }}>
          Clear Token
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Token Status</h2>
        <p>{tokenStatus}</p>
      </div>
      
      <div>
        <h2>Token Info</h2>
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', whiteSpace: 'pre-wrap' }}>
          {cookieInfo}
        </pre>
      </div>
    </div>
  );
}