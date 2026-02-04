class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  // Helper methods
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Always get the latest token from localStorage
    const currentToken = localStorage.getItem('token') || this.token;

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      mode: 'cors',
      cache: 'no-store',
      credentials: 'include',
      ...options,
    };

    if (options.body) {
      config.body = options.body;
    }

    // Avoid sending Content-Type on GET/HEAD to prevent unnecessary CORS preflight
    const method = (config.method || 'GET').toUpperCase();
    if ((method === 'GET' || method === 'HEAD') && config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
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

      // Handle empty/no-content responses safely
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 204 || contentType.length === 0) {
        return { success: true, data: null };
      }

      // Prefer JSON; fallback to text if parsing fails
      let data;
      try {
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = { success: true, data: text };
          }
        }
      } catch (parseError) {
        console.error('API JSON parse error:', parseError);
        const text = await response.text().catch(() => null);
        return { success: true, data: text };
      }

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

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
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
    try {
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);
      if (maxResults) params.append('maxResults', maxResults);

      return await this.request(`/google/calendar/events?${params.toString()}`);
    } catch (error) {
      console.error('Google Calendar Events Error:', error);

      // Check for various forms of invalid_grant or auth expired errors
      const isAuthExpired = (
        error.message.includes('Google Calendar access expired') ||
        error.message.includes('invalid_grant') ||
        error.message.includes('requiresReauth') ||
        (error.response && error.response.status === 401) ||
        (error.status === 401)
      );

      if (isAuthExpired) {
        console.log('Google Calendar access expired, redirecting to reconnect...');

        // Show user-friendly message
        if (window.confirm('Google Calendar bağlantınızın süresi dolmuş. Yeniden bağlanmak ister misiniz?')) {
          window.location.href = '/google-connect';
        }

        return {
          success: false,
          data: [],
          message: 'Google Calendar access expired',
          requiresReauth: true
        };
      }

      // For other errors, show a generic message
      console.error('Google Calendar API Error:', error);
      return {
        success: false,
        data: [],
        message: 'Google Calendar verilerine erişilemiyor',
        error: error.message
      };
    }
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
    return this.request('/google/status');
  }

  async loadAvailabilityFromGoogleCalendar() {
    return this.request('/google/calendar/load-availability', { method: 'POST' });
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

  async requestEmailChange(newEmail) {
    return this.request('/students/email/request-change', {
      method: 'POST',
      body: JSON.stringify({ newEmail })
    });
  }

  async verifyEmailChange(verificationCode) {
    return this.request('/students/email/verify-change', {
      method: 'POST',
      body: JSON.stringify({ verificationCode })
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

  async cancelFacultyAppointment(appointmentId, cancellationReason = '') {
    return this.request(`/faculty/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason })
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
    return this.request(`/users/${userId}`);
  }

  async getUserByEmail(email) {
    return this.request(`/users/email/${encodeURIComponent(email)}`);
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

  async cancelAdminAppointment(appointmentId, cancellationReason = '') {
    return this.request(`/admin/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason })
    });
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

  // Get unread notifications
  async getUnreadNotifications() {
    return this.request('/notifications/unread', {
      method: 'GET'
    });
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT'
    });
  }

  // Department methods
  async getDepartments() {
    return this.request('/departments');
  }

  async addDepartment(name) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }

  async deleteDepartment(departmentId) {
    return this.request(`/departments/${departmentId}`, {
      method: 'DELETE'
    });
  }

  // System Settings methods
  async getSystemSettings() {
    return this.request('/settings');
  }

  async getSetting(key) {
    return this.request(`/settings/${key}`);
  }

  async updateSetting(key, value) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  // Convenience HTTP methods
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 