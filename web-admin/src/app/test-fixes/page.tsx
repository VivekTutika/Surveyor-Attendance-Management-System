'use client';

import { useState, useEffect } from 'react';
import { surveyorService } from '@/services/api';
import Cookies from 'js-cookie';

export default function TestFixesPage() {
  const [surveyors, setSurveyors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<string | null>(null);

  useEffect(() => {
    // Check token
    const token = Cookies.get('adminToken');
    if (token) {
      setTokenInfo(`Token found, length: ${token.length}`);
    } else {
      setTokenInfo('No token found');
    }

    // Fetch surveyors
    const fetchSurveyors = async () => {
      try {
        setLoading(true);
        const data = await surveyorService.getAll();
        setSurveyors(data);
        setError(null);
      } catch (err: any) {
        setError(`Error: ${err.message}`);
        console.error('Error fetching surveyors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyors();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Fixes Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Token Status</h2>
        <p>{tokenInfo}</p>
      </div>
      
      <div>
        <h2>Surveyors Data</h2>
        {loading && <p>Loading surveyors...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <div>
            <p>Found {surveyors.length} surveyors</p>
            <pre>{JSON.stringify(surveyors, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}