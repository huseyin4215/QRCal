class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  // Helper methods
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('token') || this.token;
    
    console.log('ApiService - Current token:', currentToken);
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
      console.log('ApiService - Authorization header set:', headers['Authorization']);
    } else {
      console.log('ApiService - No token found');
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    if (options.body) {
      config.body = options.body;
    }

    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    console.log('API Headers:', config.headers);

    try {
      const response = await fetch(url, config);
      
      console.log(`API Response Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('API: 401 Unauthorized - clearing token and redirecting');
        // Token expired or invalid, clear token and redirect to login
        this.clearToken();
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        // Throw an error instead of returning undefined
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Geçersiz e-posta veya şifre');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('API Error Response:', error);
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: error
        });
        throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Token management
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Authentication methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async googleAuth(idToken) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST'
    });
  }

  // Google Calendar methods
  async getGoogleAuthUrl() {
    return this.request('/google/auth-url');
  }

  async getGoogleCalendarEvents(timeMin, timeMax, maxResults = 50) {
    const params = new URLSearchParams();
    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);
    if (maxResults) params.append('maxResults', maxResults);
    
    return this.request(`/google/calendar/events?${params.toString()}`);
  }

  async createGoogleCalendarEvent(eventData) {
    return this.request('/google/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async createAppointmentCalendarEvent(appointmentData) {
    return this.request('/google/calendar/appointment-event', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  async getGoogleCalendarStatus() {
    return this.request('/google/status', 'GET');
  }

  async loadAvailabilityFromGoogleCalendar() {
    return this.request('/google/calendar/load-availability', 'POST');
  }

  async disconnectGoogleCalendar() {
    return this.request('/google/disconnect', {
      method: 'DELETE'
    });
  }

  // Faculty methods
  async getFacultyProfile() {
    return this.request('/faculty/profile');
  }

  async updateFacultyProfile(profileData) {
    return this.request('/faculty/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async updateStudentProfile(profileData) {
    return this.request('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getFacultyAvailability() {
    return this.request('/faculty/availability');
  }

  async updateFacultyAvailability(availabilityData) {
    return this.request('/faculty/availability', {
      method: 'PUT',
      body: JSON.stringify(availabilityData)
    });
  }

  async getFacultyAppointments() {
    return this.request('/faculty/appointments');
  }

  async getFacultyAppointment(appointmentId) {
    return this.request(`/faculty/appointments/${appointmentId}`);
  }

  async approveAppointment(appointmentId) {
    return this.request(`/faculty/appointments/${appointmentId}/approve`, {
      method: 'PUT'
    });
  }

  async rejectAppointment(appointmentId, reason) {
    return this.request(`/faculty/appointments/${appointmentId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason: reason })
    });
  }

  async cancelAppointment(appointmentId, studentEmail, cancellationReason = '') {
    const requestBody = {
      studentEmail,
      cancellationReason
    };
    
    console.log('cancelAppointment request body:', requestBody);
    
    return this.request(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify(requestBody)
    });
  }

  async updateAppointment(appointmentId, updateData) {
    return this.request(`/faculty/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  // Faculty QR Code methods
  async getQrCode() {
    return this.request('/faculty/qr-code');
  }

  async generateQrCode() {
    return this.request('/faculty/qr-code', {
      method: 'POST'
    });
  }

  async getFacultyStats() {
    return this.request('/faculty/stats');
  }

  async getFacultySlots(facultySlug, date) {
    return this.request(`/faculty/${facultySlug}/slots?date=${date}`);
  }

  // Public appointment methods
  async getFacultyBySlug(slug) {
    return this.request(`/appointments/faculty/${slug}`);
  }

  async getFacultySlots(slug, date) {
    return this.request(`/appointments/faculty/${slug}/slots?date=${date}`);
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  async checkAppointmentStatus(appointmentId) {
    return this.request(`/appointments/check/${appointmentId}`);
  }

  // Student methods
  async getStudentAppointments() {
    return this.request('/appointments/student');
  }

  async getFacultyList() {
    return this.request('/users/faculty');
  }

  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  // QR Code methods
  async generateQRCode(slug) {
    return this.request(`/qr/generate/${slug}`);
  }

  async getQRCodeImage(slug) {
    return this.request(`/qr/image/${slug}`);
  }

  async generateCustomQRCode(data, options) {
    return this.request('/qr/custom', {
      method: 'POST',
      body: JSON.stringify({ data, options })
    });
  }

  async generatePDF(data) {
    return this.request('/qr/pdf', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Admin methods
  async getAllUsers() {
    return this.request('/admin/users');
  }

  async createFaculty(facultyData) {
    return this.request('/admin/users/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  }

  async getUserById(userId) {
    return this.request(`/admin/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async getAllAppointments() {
    return this.request('/admin/appointments');
  }

  async getAppointmentById(appointmentId) {
    return this.request(`/admin/appointments/${appointmentId}`);
  }

  async getSystemStats() {
    return this.request('/admin/stats');
  }

  async getDepartmentStats() {
    return this.request('/admin/stats/departments');
  }

  async exportAppointments(format = 'csv') {
    return this.request(`/admin/export/appointments?format=${format}`);
  }

  // Admin availability methods (as faculty)
  async getAdminAvailability() {
    return this.request('/admin/availability');
  }

  async updateAdminAvailability(availabilityData) {
    return this.request('/admin/availability', {
      method: 'PUT',
      body: JSON.stringify(availabilityData)
    });
  }

  // Admin QR Code methods (as faculty)
  async getAdminQrCode() {
    return this.request('/admin/qr-code');
  }

  async generateAdminQrCode() {
    return this.request('/admin/qr-code', {
      method: 'POST'
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 