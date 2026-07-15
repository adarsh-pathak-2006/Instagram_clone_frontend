const BASE_URL = 'http://127.0.0.1:8000';

export const fetchAPI = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const isFormData = options.body instanceof FormData;
  const headers = { ...options.headers };
  
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle unauthorized by logging out
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }

  return response;
};

// Auth
export const loginUser = async (username, password) => {
  return fetchAPI('/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
};

export const registerUser = async (data) => {
  return fetchAPI('/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Profile
export const getMyProfile = async () => {
  return fetchAPI('/api/auth/my-profile/');
};

export const getProfile = async (id) => {
  return fetchAPI(`/api/auth/path/${id}/`);
};

export const toggleFollow = async (id) => {
  return fetchAPI(`/api/auth/follow/${id}/`, { method: 'POST' });
};

// Posts & Feed
export const getPosts = async () => {
  return fetchAPI('/api/core/post/');
};

export const getReels = async () => {
  return fetchAPI('/api/core/reel/');
};

export const createPost = async (formData) => {
  return fetchAPI('/api/core/post/', {
    method: 'POST',
    body: formData,
  });
};

export const createReel = async (formData) => {
  return fetchAPI('/api/core/reel/', {
    method: 'POST',
    body: formData,
  });
};
