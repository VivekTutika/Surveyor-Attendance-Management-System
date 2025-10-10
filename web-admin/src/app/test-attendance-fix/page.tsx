'use client';

import { useState } from 'react';
import { attendanceService } from '@/services/api';

export default function TestAttendanceFixPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testAttendance = async () => {
    setLoading(true);
    setResult('Testing attendance API with pagination...');
    try {
      const data = await attendanceService.getAll({
        page: 1,
        limit: 10
      });
      setResult(`Success! Found ${data.attendance.length} attendance records. Total: ${data.total}, Page: ${data.page}, Pages: ${data.pages}`);
    } catch (error: any) {
      console.error('Attendance test error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Attendance test failed';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Attendance Fix Test</h1>
      <p>This page tests the attendance API with pagination to verify our fix.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testAttendance} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          Test Attendance API
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