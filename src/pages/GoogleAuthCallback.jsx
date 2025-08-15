import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import apiService from '../services/apiService';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
      return;
    }

    if (code) {
      // OAuth 2.0 authorization code received
      setStatus('loading');
      setMessage('Google OAuth işleniyor...');
      
      // Exchange code for token by calling backend
      handleOAuthCallback(code);
    } else if (token) {
      // Token received from Google OAuth callback
      setStatus('success');
      setMessage('Google Calendar başarıyla bağlandı!');

      // Store token and redirect
      localStorage.setItem('token', token);
      apiService.setToken(token);
      
      // Get user data
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update user context
          login(token, data.data);
          
          // Redirect based on user role
          setTimeout(() => {
            if (data.data.role === 'admin') {
              navigate('/admin-dashboard');
            } else if (data.data.role === 'faculty') {
              navigate('/faculty-dashboard');
            } else if (data.data.role === 'student') {
              navigate('/student-dashboard');
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        } else {
          throw new Error('Failed to get user data');
        }
      })
      .catch(error => {
        console.error('Error getting user data:', error);
        setStatus('error');
        setMessage('Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.');
      });
    } else {
      setStatus('error');
      setMessage('Geçersiz callback. Lütfen tekrar deneyin.');
    }
  }, [searchParams, navigate, login]);

  const handleOAuthCallback = async (code) => {
    try {
      // Call backend to exchange code for token
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/google/callback?code=${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.token) {
        setStatus('success');
        setMessage('Google Calendar başarıyla bağlandı!');
        
        // Store token and redirect
        localStorage.setItem('token', data.token);
        apiService.setToken(data.token);
        
        // Update user context
        if (data.user) {
          login(data.token, data.user);
        }
        
        // Redirect to faculty dashboard
        setTimeout(() => {
          navigate('/faculty-dashboard?googleConnected=true');
        }, 2000);
      } else {
        throw new Error(data.message || 'Token alınamadı');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage('Google Calendar bağlantısı başarısız: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Google Calendar Bağlanıyor...
              </h2>
              <p className="text-gray-600">
                Lütfen bekleyin, hesabınız bağlanıyor.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Başarılı!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Yönlendiriliyorsunuz...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Hata Oluştu
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Dashboard'a Dön
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 