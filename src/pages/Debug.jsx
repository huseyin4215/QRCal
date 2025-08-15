import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Debug = () => {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Collect debug information
    const info = {
      user: user,
      loading: loading,
      localStorage: {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user')
      },
      location: window.location.href,
      userAgent: navigator.userAgent
    };
    setDebugInfo(info);
  }, [user, loading]);

  const testAuth = async () => {
    try {
      console.log('Testing authentication...');
      const response = await apiService.getCurrentUser();
      setTestResults({ success: true, data: response });
    } catch (error) {
      setTestResults({ success: false, error: error.message });
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Sayfası</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auth Context Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Auth Context</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Evet' : 'Hayır'}</p>
              <p><strong>User:</strong> {user ? 'Mevcut' : 'Yok'}</p>
              {user && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Department:</strong> {user.department}</p>
                  <p><strong>Is Active:</strong> {user.isActive ? 'Evet' : 'Hayır'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Local Storage Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
            <div className="space-y-2">
              <p><strong>Token:</strong> {debugInfo.localStorage?.token ? 'Mevcut' : 'Yok'}</p>
              <p><strong>User:</strong> {debugInfo.localStorage?.user ? 'Mevcut' : 'Yok'}</p>
              {debugInfo.localStorage?.user && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(JSON.parse(debugInfo.localStorage.user), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Sonuçları</h2>
            <div className="space-y-4">
              <button
                onClick={testAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Auth Test Et
              </button>
              
              {testResults.success !== undefined && (
                <div className={`p-4 rounded ${testResults.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p><strong>Sonuç:</strong> {testResults.success ? 'Başarılı' : 'Başarısız'}</p>
                  {testResults.error && <p className="text-red-600">{testResults.error}</p>}
                  {testResults.data && (
                    <pre className="text-xs mt-2 overflow-auto">
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">İşlemler</h2>
            <div className="space-y-4">
              <button
                onClick={clearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Local Storage Temizle
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>

        {/* Raw Debug Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ham Debug Bilgileri</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Debug; 