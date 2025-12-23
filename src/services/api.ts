const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Helper to get a Clerk session token for API calls
const getClerkToken = async () => {
  const clerk = (window as any)?.Clerk;
  if (clerk?.session) {
    try {
      const template = import.meta.env.VITE_CLERK_JWT_TEMPLATE || undefined;
      return await clerk.session.getToken(template ? { template } : undefined);
    } catch (err) {
      console.warn('[api] Failed to fetch Clerk token', err);
    }
  }
  return null;
};

// Helper function to get headers with auth (async for Clerk)
const getHeaders = async (useJson = true) => {
  const token = await getClerkToken();
  const headers: Record<string, string> = {};
  if (useJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// API service class
class ApiService {
  // Auth endpoints
  async login(email: string, password: string) {
    throw new Error('Password login is disabled. Please sign in with Clerk using your email OTP.');
  }

  async verifyToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: await getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    
    return response.json();
  }

  // User endpoints
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }

  async updateUserProfile(data: { phone?: string; cabin?: string; availability?: string; bio?: string }) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(error.message || 'Failed to update profile');
    }
    
    return response.json();
  }

  async getMyMentor() {
    const response = await fetch(`${API_BASE_URL}/users/my-mentor`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mentor');
    return response.json();
  }

  async getMentees() {
    const response = await fetch(`${API_BASE_URL}/users/mentees`, {
      headers: await getHeaders(),
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
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }
    
    return response.json();
  }

  async getMeeting(id: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch meeting');
    }
    
    return response.json();
  }

  async createMeeting(meetingData: any) {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: await getHeaders(),
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
      headers: await getHeaders(),
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
      headers: await getHeaders(),
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
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete meeting');
    }
    
    return response.json();
  }

  async downloadMeetingPDF(meetingId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/download`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download meeting PDF' }));
      throw new Error(error.message || 'Failed to download meeting PDF');
    }
    return response.blob();
  }

  async getMenteesList() {
    const response = await fetch(`${API_BASE_URL}/meetings/mentees/list`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentees list');
    }
    
    return response.json();
  }

  // Mentee-facing meetings
  async getMenteeMeetings(status?: string) {
    const url = status ? `${API_BASE_URL}/meetings/for-mentee?status=${status}` : `${API_BASE_URL}/meetings/for-mentee`;
    const response = await fetch(url, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch mentee meetings');
    return response.json();
  }

  // Resource endpoints
  async getResources() {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }
    
    return response.json();
  }

  async createResource(data: { title: string; description?: string; url?: string; file?: File; is_public?: boolean }) { // is_public parameter kept for backward compatibility but not used
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.url) formData.append('url', data.url);
    if (data.file) formData.append('file', data.file);
    if (data.is_public !== undefined) formData.append('is_public', String(data.is_public));
    if (data.file) formData.append('resource_type', 'file');
    else if (data.url) formData.append('resource_type', 'link');

    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: 'POST',
      headers: await getHeaders(false),
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create resource' }));
      throw new Error(error.message || 'Failed to create resource');
    }
    
    return response.json();
  }

  async downloadResourceFile(fileUrl: string): Promise<Blob> {
    // fileUrl from database is already in format /api/resources/files/filename
    // API_BASE_URL is http://localhost:5001/api
    // So we need to construct the URL properly
    const baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api to get base URL
    const url = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download file' }));
      throw new Error(error.message || 'Failed to download file');
    }
    
    return response.blob();
  }

  // Report endpoints
  async getReports() {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    
    return response.json();
  }

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/users/dashboard/stats`, {
      headers: await getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  // Session Requests
  async getSessionRequests(status?: string) {
    const url = status ? `${API_BASE_URL}/session-requests?status=${status}` : `${API_BASE_URL}/session-requests`;
    const response = await fetch(url, { headers: await getHeaders() });
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
      headers: await getHeaders(),
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
      headers: await getHeaders(),
      body: JSON.stringify({ status, mentor_notes }),
    });
    if (!response.ok) throw new Error('Failed to update session request');
    return response.json();
  }

  async deleteSessionRequest(id: string) {
    const response = await fetch(`${API_BASE_URL}/session-requests/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to cancel session request');
    return response.json();
  }

  // Personal Information API methods
  async getPersonalInfo() {
    const response = await fetch(`${API_BASE_URL}/personal-info`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch personal information');
    return response.json();
  }

  async savePersonalInfo(data: any) {
    const response = await fetch(`${API_BASE_URL}/personal-info`, {
      method: 'POST',
      headers: await getHeaders(),
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
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch mentee profile');
    return response.json();
  }

  async downloadMenteesPersonalInfo(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/personal-info/mentees/export`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download mentees data' }));
      throw new Error(error.message || 'Failed to download mentees data');
    }
    return response.blob();
  }

  async downloadMenteePersonalInfoPDF(menteeId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/personal-info/mentee/${menteeId}/pdf`, {
      method: 'GET',
      headers: await getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to download PDF' }));
      throw new Error(error.message || 'Failed to download PDF');
    }
    return response.blob();
  }

  // Notification endpoints
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  }

  async getUnreadNotificationsCount() {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    
    return response.json();
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return response.json();
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: await getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
