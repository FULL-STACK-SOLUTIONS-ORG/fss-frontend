import axios from 'axios';
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api';
if (import.meta.env?.MODE === 'development' || !import.meta.env?.VITE_API_URL) {
  if (!import.meta.env?.VITE_API_URL) {
  }
}
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const TokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  setRefreshToken: (token) => localStorage.setItem('refreshToken', token),
  removeTokens: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
};
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token && !config.url.includes('/auth/login') && !config.url.includes('/auth/setup')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAdminAuthenticated) {
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '9061';
      config.headers['x-admin-secret'] = ADMIN_PASSWORD;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken && !TokenManager.isTokenExpired(refreshToken)) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshToken
          });
          if (refreshResponse.data.token) {
            TokenManager.setToken(refreshResponse.data.token);
            if (refreshResponse.data.user) {
              localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
            }
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          TokenManager.removeTokens();
          if (typeof window !== 'undefined') {
            if (window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/login';
            }
          }
        }
      } else {
        TokenManager.removeTokens();
        if (typeof window !== 'undefined') {
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          } else {
            window.location.href = '/login';
          }
        }
      }
    }
    const errorResponse = {
      type: 'API_ERROR',
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An error occurred',
      data: error.response?.data
    };
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const validationErrors = {};
      error.response.data.errors.forEach(err => {
        validationErrors[err.field] = err.message;
      });
      errorResponse.type = 'VALIDATION_ERROR';
      errorResponse.validationErrors = validationErrors;
    }
    if (!error.response) {
      errorResponse.type = 'NETWORK_ERROR';
      errorResponse.message = 'Network error occurred. Please check your connection.';
      errorResponse.diagnostic = {
        apiBaseURL: API_BASE_URL,
        requestURL: error.config?.url,
        fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
        method: error.config?.method?.toUpperCase(),
        isTimeout: error.code === 'ECONNABORTED',
        errorCode: error.code
      };
      console.error('❌ Network Error Details:', {
        message: errorResponse.message,
        ...errorResponse.diagnostic,
        timestamp: new Date().toISOString()
      });
      if (error.code === 'ECONNABORTED') {
        errorResponse.message = 'Request timeout. The server took too long to respond.';
      } else if (error.message === 'Network Error') {
        errorResponse.message = `Cannot reach server at ${errorResponse.diagnostic.fullURL}. Please check your connection and verify the API URL is correct.`;
      }
    }
    return Promise.reject(errorResponse);
  }
);
export const enquiryAPI = {
  create: async (enquiryData) => {
    return apiClient.post('/enquiries', enquiryData);
  },
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/enquiries${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getById: async (id) => {
    return apiClient.get(`/enquiries/${id}`);
  },
  updateStatus: async (id, status, reason) => {
    return apiClient.patch(`/enquiries/${id}/status`, { status, reason });
  },
  addNote: async (id, note, isPrivate = false) => {
    return apiClient.post(`/enquiries/${id}/notes`, { note, isPrivate });
  },
  getStats: async () => {
    return apiClient.get('/enquiries/stats');
  },
  delete: async (id) => {
    return apiClient.delete(`/enquiries/${id}`);
  },
};
export const authAPI = {
  signup: async (email, password, name) => {
    return await apiClient.post('/auth/signup', { email, password, name });
  },
  verifyOTP: async (userId, otp) => {
    const data = await apiClient.post('/auth/verify-otp', { userId, otp });
    if (data?.token) {
      TokenManager.setToken(data.token);
      if (data?.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  resendOTP: async (userId) => {
    return await apiClient.post('/auth/resend-otp', { userId });
  },
  login: async (email, password) => {
    const data = await apiClient.post('/auth/login', { email, password });
    if (data?.token) {
      TokenManager.setToken(data.token);
      if (data?.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      TokenManager.removeTokens();
    }
  },
  getMe: async () => {
    return apiClient.get('/auth/me');
  },
  getProfile: async () => {
    return apiClient.get('/auth/me');
  },
  refreshToken: async () => {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    if (response.data?.accessToken) {
      TokenManager.setToken(response.data.accessToken);
    }
    return response;
  },
  createAdmin: async (adminData) => {
    return apiClient.post('/auth/setup', adminData);
  },
};
export const dashboardAPI = {
  getOverview: async () => {
    return apiClient.get('/dashboard/overview');
  },
  getAnalytics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/dashboard/analytics${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getPerformance: async () => {
    return apiClient.get('/dashboard/performance');
  },
  exportEnquiries: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/dashboard/export${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
};
export const emailAPI = {
  getStatus: async () => {
    return apiClient.get('/emails/status');
  },
  testEmail: async (testEmail) => {
    return apiClient.post('/emails/test', { testEmail });
  },
  sendCustomEmail: async (emailData) => {
    return apiClient.post('/emails/custom', emailData);
  },
  sendFollowUpReminders: async () => {
    return apiClient.post('/emails/follow-up-reminders');
  },
  sendWeeklyReport: async () => {
    return apiClient.post('/emails/weekly-report');
  },
};
export const systemAPI = {
  healthCheck: async () => {
    return apiClient.get('/health');
  },
};
export const mentorAPI = {
  create: async (mentorData) => {
    return apiClient.post('/mentors', mentorData);
  },
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/mentors${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getById: async (id) => {
    return apiClient.get(`/mentors/${id}`);
  },
  updateStatus: async (id, status, reason) => {
    return apiClient.patch(`/mentors/${id}/status`, { status, reason });
  },
  getStats: async () => {
    return apiClient.get('/mentors/stats');
  },
  delete: async (id) => {
    return apiClient.delete(`/mentors/${id}`);
  },
};
export const applicantAPI = {
  create: async (applicantData) => {
    return apiClient.post('/applicants', applicantData);
  },
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/applicants${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getById: async (id) => {
    return apiClient.get(`/applicants/${id}`);
  },
  updateStatus: async (id, status) => {
    return apiClient.patch(`/applicants/${id}/status`, { status });
  },
  getStats: async () => {
    return apiClient.get('/applicants/stats');
  },
  delete: async (id) => {
    return apiClient.delete(`/applicants/${id}`);
  },
};
export const moduleAPI = {
  getAll: async () => {
    return apiClient.get('/modules');
  },
  getById: async (id) => {
    return apiClient.get(`/modules/${id}`);
  },
  create: async (moduleData) => {
    return apiClient.post('/modules', moduleData);
  },
  update: async (id, moduleData) => {
    return apiClient.put(`/modules/${id}`, moduleData);
  },
  delete: async (id) => {
    return apiClient.delete(`/modules/${id}`);
  },
  addTopic: async (moduleId, topicData) => {
    return apiClient.post(`/modules/${moduleId}/topics`, topicData);
  },
  updateTopic: async (moduleId, topicId, topicData) => {
    return apiClient.put(`/modules/${moduleId}/topics/${topicId}`, topicData);
  },
  deleteTopic: async (moduleId, topicId) => {
    return apiClient.delete(`/modules/${moduleId}/topics/${topicId}`);
  },
  getTopicQuizzes: async (moduleId, topicId) => {
    return apiClient.get(`/modules/${moduleId}/topics/${topicId}/quizzes`);
  },
  reorder: async (modules) => {
    return apiClient.put('/modules/reorder', { modules });
  },
};
export const progressAPI = {
  getProgress: async () => {
    return apiClient.get('/progress');
  },
  toggleTopic: async (moduleId, topicId) => {
    const networkStart = performance.now();
    try {
      const response = await apiClient.post('/progress/topic', { moduleId, topicId });
      const networkEnd = performance.now();
      const networkTime = networkEnd - networkStart;
      if (response._performance) {
        const backendTime = response._performance.backendTime;
        const networkLatency = networkTime - backendTime;
      }
      return response;
    } catch (error) {
      const networkEnd = performance.now();
      throw error;
    }
  },
  toggleModule: async (moduleId) => {
    return apiClient.post('/progress/module', { moduleId });
  },
  getStats: async () => {
    return apiClient.get('/progress/stats');
  },
  getUserRanking: async () => {
    return apiClient.get('/progress/ranking');
  },
  submitQuizAttempt: async (attemptData) => {
    return apiClient.post('/progress/quiz', attemptData);
  },
  toggleTask: async (taskId, submissionLink) => {
    return apiClient.post('/progress/task', { taskId, submissionLink });
  },
  submitAllTasks: async (moduleId, tasks) => {
    return apiClient.post('/progress/tasks/all', { moduleId, tasks });
  },
  requestReview: async (moduleId) => {
    return apiClient.post('/progress/review-request', { moduleId });
  },
  getAllSubmittedTasks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/progress/tasks${queryString ? `?${queryString}` : ''}`);
  },
  verifyTask: async (userId, taskId, status, adminComment) => {
    return apiClient.put('/progress/tasks/verify', { userId, taskId, status, adminComment });
  },
  deleteModuleTasks: async (userId, moduleNumber) => {
    return apiClient.delete('/progress/tasks/module', { data: { userId, moduleNumber } });
  },
  deleteTaskProgress: async (userId, taskId) => {
    return apiClient.delete('/progress/tasks', { data: { userId, taskId } });
  },
  updateModuleConnections: async (moduleId, connections) => {
    return apiClient.put('/progress/module/connections', { moduleId, connections });
  },
  deleteReviewRequest: async (userId, moduleId) => {
    return apiClient.delete('/progress/review-request', { data: { userId, moduleId } });
  }
};
export const userAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getStats: async () => {
    return apiClient.get('/users/stats');
  },
  delete: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },
  updateDashboardApproval: async (id, isApproved) => {
    return apiClient.put(`/users/${id}/dashboard-approval`, { isApproved });
  },
  addReview: async (userId, reviewData) => {
    return apiClient.put(`/users/${userId}/review`, reviewData);
  },
  updateMaxUnlockedModule: async (userId, maxUnlockedModuleNumber) => {
    return apiClient.put(`/users/${userId}/unlock-modules`, { maxUnlockedModuleNumber });
  },
  updateProfile: async (data) => {
    return apiClient.put('/users/profile', data);
  },
  updateUserAdmin: async (userId, data) => {
    return apiClient.put(`/users/${userId}/admin-update`, data);
  }
};
export const feedbackAPI = {
  create: async (data) => {
    return apiClient.post('/feedback', data);
  },
  getAll: async () => {
    return apiClient.get('/feedback');
  },
  delete: async (id) => {
    return apiClient.delete(`/feedback/${id}`);
  }
};
export const socialMediaAPI = {
  create: async (postData) => {
    return apiClient.post('/social-media', postData);
  },
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/social-media${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  update: async (id, postData) => {
    return apiClient.put(`/social-media/${id}`, postData);
  },
  delete: async (id) => {
    return apiClient.delete(`/social-media/${id}`);
  },
  getAllStudentPosts: async (userId = null, moduleId = null) => {
    const params = {};
    if (userId) params.userId = userId;
    if (moduleId) params.moduleId = moduleId;
    return apiClient.get('/social-media/students', { params });
  },
  getStats: async () => {
    return apiClient.get('/social-media/stats');
  }
};

export const programModuleAPI = {
  getAll: async () => {
    return apiClient.get('/program-modules');
  },
  getById: async (id) => {
    return apiClient.get(`/program-modules/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/program-modules', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/program-modules/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/program-modules/${id}`);
  },
  addTask: async (moduleId, taskData) => {
    return apiClient.post(`/program-modules/${moduleId}/tasks`, taskData);
  },
  updateTask: async (moduleId, taskId, taskData) => {
    return apiClient.put(`/program-modules/${moduleId}/tasks/${taskId}`, taskData);
  },
  deleteTask: async (moduleId, taskId) => {
    return apiClient.delete(`/program-modules/${moduleId}/tasks/${taskId}`);
  }
};
export const clientAPI = {
  create: async (clientData) => {
    return apiClient.post('/clients', clientData);
  },
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/clients${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getById: async (id) => {
    return apiClient.get(`/clients/${id}`);
  },
  update: async (id, clientData) => {
    return apiClient.put(`/clients/${id}`, clientData);
  },
  delete: async (id) => {
    return apiClient.delete(`/clients/${id}`);
  },
  getStats: async () => {
    return apiClient.get('/clients/stats');
  },
  addInvoice: async (id, data) => {
    return apiClient.post(`/clients/${id}/invoices`, data);
  },
  addPayment: async (id, data) => {
    return apiClient.post(`/clients/${id}/payments`, data);
  },
  updateInvoice: async (clientId, invoiceId, data) => {
    return apiClient.put(`/clients/${clientId}/invoices/${invoiceId}`, data);
  },
  deleteInvoice: async (clientId, invoiceId) => {
    return apiClient.delete(`/clients/${clientId}/invoices/${invoiceId}`);
  },
  updatePayment: async (clientId, paymentId, data) => {
    return apiClient.put(`/clients/${clientId}/payments/${paymentId}`, data);
  },
  deletePayment: async (clientId, paymentId) => {
    return apiClient.delete(`/clients/${clientId}/payments/${paymentId}`);
  }
};

export const activityAPI = {
  create: async (activityData) => {
    return apiClient.post('/activities', activityData);
  },
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/activities${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },
  getById: async (id) => {
    return apiClient.get(`/activities/${id}`);
  },
  update: async (id, activityData) => {
    return apiClient.put(`/activities/${id}`, activityData);
  },
  delete: async (id) => {
    return apiClient.delete(`/activities/${id}`);
  },
  getCategories: async () => {
    return apiClient.get('/activities/categories');
  },
  createCategory: async (categoryData) => {
    return apiClient.post('/activities/categories', categoryData);
  },
  deleteCategory: async (id) => {
    return apiClient.delete(`/activities/categories/${id}`);
  },
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/activities/stats${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  }
};

export { TokenManager };
const api = {
  enquiry: enquiryAPI,
  mentor: mentorAPI,
  applicant: applicantAPI,
  module: moduleAPI,
  auth: authAPI,
  progress: progressAPI,
  user: userAPI,
  feedback: feedbackAPI,
  socialMedia: socialMediaAPI,
  programModule: programModuleAPI,
  client: clientAPI,
  dashboard: dashboardAPI,
  email: emailAPI,
  system: systemAPI,
  TokenManager
};
export default api;