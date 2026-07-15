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

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Skip interceptor for login and register endpoints so they can handle their own errors
  if (endpoint === '/token/' || endpoint === '/register/') {
    return response;
  }

  // Handle unauthorized by attempting token refresh
  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // If we have a refresh token and we're not already trying to refresh (prevent infinite loops)
    if (refreshToken && endpoint !== '/token/refresh/') {
      try {
        const refreshRes = await fetch(`${BASE_URL}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          // Save new access token
          localStorage.setItem('access_token', data.access);
          // Update headers with new token
          headers['Authorization'] = `Bearer ${data.access}`;
          
          // Retry original request
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          return response;
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }
    
    // If refresh failed or no refresh token exists, log out
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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

export const getSuggestions = async () => {
  return fetchAPI('/api/auth/suggestions/');
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

// Post Interactions
export const likePost = async (id) => {
  return fetchAPI(`/api/core/post/${id}/like/`, { method: 'POST' });
};

export const likeReel = async (id) => {
  return fetchAPI(`/api/core/reel/${id}/like/`, { method: 'POST' });
};

export const getPostComments = async (id) => {
  return fetchAPI(`/api/core/postcomment/${id}/`);
};

export const addPostComment = async (id, commentText) => {
  return fetchAPI(`/api/core/postcomment/${id}/`, {
    method: 'POST',
    body: JSON.stringify({ comment: commentText }),
  });
};

export const addPostReply = async (postId, commentId, replyText) => {
  return fetchAPI(`/api/core/postcomment/${postId}/${commentId}/`, {
    method: 'POST',
    body: JSON.stringify({ reply: replyText }),
  });
};
