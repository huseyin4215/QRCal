// API Service - Handles all backend API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Helper method to set auth token
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Helper method to remove auth token
  removeAuthToken() {
    localStorage.removeItem('token');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.removeAuthToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth API methods
  async getGoogleAuthUrl() {
    return this.request('/auth/google/url', { includeAuth: false });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(token) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
      includeAuth: false,
    });
  }

  // Faculty API methods
  async getFacultyProfile() {
    return this.request('/faculty/profile');
  }

  async updateFacultyProfile(profileData) {
    return this.request('/faculty/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getFacultyAvailability() {
    return this.request('/faculty/availability');
  }

  async updateFacultyAvailability(availabilityData) {
    return this.request('/faculty/availability', {
      method: 'PUT',
      body: JSON.stringify(availabilityData),
    });
  }

  async getFacultyAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/faculty/appointments?${queryString}` : '/faculty/appointments';
    return this.request(endpoint);
  }

  async getFacultyAppointment(id) {
    return this.request(`/faculty/appointments/${id}`);
  }

  async approveAppointment(id) {
    return this.request(`/faculty/appointments/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectAppointment(id, rejectionReason) {
    return this.request(`/faculty/appointments/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async getFacultyStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/faculty/stats?${queryString}` : '/faculty/stats';
    return this.request(endpoint);
  }

  async getFacultySlots(date) {
    return this.request(`/faculty/slots/${date}`);
  }

  // Appointment API methods
  async getFacultyBySlug(slug) {
    return this.request(`/appointments/faculty/${slug}`, { includeAuth: false });
  }

  async getFacultySlots(slug, date) {
    return this.request(`/appointments/faculty/${slug}/slots?date=${date}`, { includeAuth: false });
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
      includeAuth: false,
    });
  }

  async checkAppointmentStatus(id, studentEmail) {
    return this.request(`/appointments/check/${id}?studentEmail=${studentEmail}`, { includeAuth: false });
  }

  async getStudentAppointments(email) {
    return this.request(`/appointments/student/${email}`, { includeAuth: false });
  }

  async cancelAppointment(id, studentEmail, cancellationReason) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ studentEmail, cancellationReason }),
      includeAuth: false,
    });
  }

  // QR Code API methods
  async generateQRCode(slug) {
    return this.request(`/qr/generate/${slug}`, { includeAuth: false });
  }

  async generateQRCodeImage(slug, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/qr/image/${slug}?${queryString}` : `/qr/image/${slug}`;
    
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async generateCustomQRCode(qrData) {
    return this.request('/qr/custom', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  }

  async generatePDF(pdfData) {
    return this.request('/qr/pdf', {
      method: 'POST',
      body: JSON.stringify(pdfData),
    });
  }

  // Admin API methods
  async getAdminUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request(endpoint);
  }

  async getAdminUser(id) {
    return this.request(`/admin/users/${id}`);
  }

  async updateAdminUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/appointments?${queryString}` : '/admin/appointments';
    return this.request(endpoint);
  }

  async getAdminAppointment(id) {
    return this.request(`/admin/appointments/${id}`);
  }

  async getAdminStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/stats?${queryString}` : '/admin/stats';
    return this.request(endpoint);
  }

  async getAdminDepartmentStats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/stats/departments?${queryString}` : '/admin/stats/departments';
    return this.request(endpoint);
  }

  async exportAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/admin/export/appointments?${queryString}` : '/admin/export/appointments';
    
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Health check
  async healthCheck() {
    return this.request('/health', { includeAuth: false });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 