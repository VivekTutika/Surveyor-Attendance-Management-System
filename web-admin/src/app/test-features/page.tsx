'use client';

import { useState } from 'react';
import { surveyorService, attendanceService, bikeMeterService } from '@/services/api';

export default function TestFeaturesPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testSurveyors = async () => {
    setLoading(true);
    setResult('Testing surveyors API...');
    try {
      const data = await surveyorService.getAll();
      setResult(`Success! Found ${data.length} surveyors`);
    } catch (error: any) {
      console.error('Surveyors test error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Surveyors test failed';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testAttendance = async () => {
    setLoading(true);
    setResult('Testing attendance API...');
    try {
      const data = await attendanceService.getAll();
      setResult(`Success! Found ${data.attendance.length} attendance records`);
    } catch (error: any) {
      console.error('Attendance test error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Attendance test failed';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testBikeReadings = async () => {
    setLoading(true);
    setResult('Testing bike readings API...');
    try {
      const data = await bikeMeterService.getAll();
      setResult(`Success! Found ${data.readings.length} bike readings`);
    } catch (error: any) {
      console.error('Bike readings test error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Bike readings test failed';
      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Feature Test</h1>
      <p>This page tests the surveyors, attendance, and bike meter reading features.</p>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testSurveyors} 
          disabled={loading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Test Surveyors
        </button>
        <button 
          onClick={testAttendance} 
          disabled={loading}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Test Attendance
        </button>
        <button 
          onClick={testBikeReadings} 
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          Test Bike Readings
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