const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API service class
class ApiService {
  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  }

  async verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    
    return response.json();
  }

  // User endpoints
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }

  async getMyMentor() {
    const response = await fetch(`${API_BASE_URL}/users/my-mentor`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mentor');
    return response.json();
  }

  async getMentees() {
    const response = await fetch(`${API_BASE_URL}/users/mentees`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentees');
    }
    
    return response.json();
  }

  // Meeting endpoints
  async getMeetings(status?: string) {
    const url = status ? `${API_BASE_URL}/meetings?status=${status}` : `${API_BASE_URL}/meetings`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }
    
    return response.json();
  }

  async getMeeting(id: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch meeting');
    }
    
    return response.json();
  }

  async createMeeting(meetingData: any) {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(meetingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create meeting');
    }
    
    return response.json();
  }

  async updateMeeting(id: string, meetingData: any) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(meetingData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update meeting');
    }
    
    return response.json();
  }

  async completeMeeting(id: string, comments: string, actionPoints: string, attendance: string[]) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comments, actionPoints, attendance }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete meeting');
    }
    
    return response.json();
  }

  async deleteMeeting(id: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete meeting');
    }
    
    return response.json();
  }

  async getMenteesList() {
    const response = await fetch(`${API_BASE_URL}/meetings/mentees/list`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentees list');
    }
    
    return response.json();
  }

  // Mentee-facing meetings
  async getMenteeMeetings(status?: string) {
    const url = status ? `${API_BASE_URL}/meetings/for-mentee?status=${status}` : `${API_BASE_URL}/meetings/for-mentee`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch mentee meetings');
    return response.json();
  }

  // Resource endpoints
  async getResources() {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }
    
    return response.json();
  }

  // Report endpoints
  async getReports() {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    
    return response.json();
  }

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/users/dashboard/stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  // Session Requests
  async getSessionRequests(status?: string) {
    const url = status ? `${API_BASE_URL}/session-requests?status=${status}` : `${API_BASE_URL}/session-requests`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch session requests');
    return response.json();
  }

  async createSessionRequest(payload: {
    title: string;
    description: string;
    preferred_date?: string;
    preferred_time?: string;
    duration_minutes?: number;
  }) {
    const response = await fetch(`${API_BASE_URL}/session-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let msg = 'Failed to create session request';
      try {
        const data = await response.json();
        if (data?.message) msg = data.message;
      } catch {}
      throw new Error(msg);
    }
    return response.json();
  }

  async updateSessionRequestStatus(id: string, status: 'pending' | 'approved' | 'rejected', mentor_notes?: string) {
    const response = await fetch(`${API_BASE_URL}/session-requests/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, mentor_notes }),
    });
    if (!response.ok) throw new Error('Failed to update session request');
    return response.json();
  }

  async deleteSessionRequest(id: string) {
    const response = await fetch(`${API_BASE_URL}/session-requests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to cancel session request');
    return response.json();
  }

  // Personal Information API methods
  async getPersonalInfo() {
    const response = await fetch(`${API_BASE_URL}/personal-info`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch personal information');
    return response.json();
  }

  async savePersonalInfo(data: any) {
    const response = await fetch(`${API_BASE_URL}/personal-info`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = 'Failed to save personal information';
      try {
        const errorData = await response.json();
        if (errorData?.message) msg = errorData.message;
      } catch {}
      throw new Error(msg);
    }
    return response.json();
  }

  async getMenteeProfile(menteeId: string) {
    const response = await fetch(`${API_BASE_URL}/personal-info/mentee/${menteeId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mentee profile');
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
