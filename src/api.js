const BASE = 'http://localhost:5001/api';
const ADMIN_TOKEN = 'admin-secret-token';

// Helper to get user role from localStorage
const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('degen_sports_user') || '{}');
    return user.role;
  } catch {
    return null;
  }
};

export async function fetchNews(league = 'all') {
  const url = league === 'all' ? `${BASE}/news` : `${BASE}/news?league=${league}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch news');
  return res.json();
}

export async function fetchScores(league = 'all') {
  const url = league === 'all' ? `${BASE}/scores` : `${BASE}/scores?league=${league}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch scores');
  return res.json();
}

export async function fetchVideos(league = 'all') {
  const url = league === 'all' ? `${BASE}/videos` : `${BASE}/videos?league=${league}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

export async function fetchPosts() {
  const res = await fetch(`${BASE}/posts`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function createPost(data) {
  const res = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create post');
  }
  return res.json();
}

export async function fetchArticles(category = 'all', limit = null, homepage = false) {
  let url = `${BASE}/articles`;
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (limit) params.append('limit', limit);
  if (homepage) params.append('homepage', 'true');
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export async function fetchArticle(identifier) {
  const res = await fetch(`${BASE}/articles/${identifier}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch article');
  }
  return res.json();
}

export async function createArticle(formData) {
  const userRole = getUserRole();
  const headers = {
    'x-admin-token': ADMIN_TOKEN,
  };
  
  // Add user role if available
  if (userRole) {
    headers['x-user-role'] = userRole;
  }
  
  // Note: Don't set Content-Type header when sending FormData
  // The browser will automatically set it with the correct boundary
  
  const res = await fetch(`${BASE}/articles`, {
    method: 'POST',
    headers,
    body: formData, // FormData object, not JSON
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create article');
  }
  return res.json();
}

export async function updateArticle(id, data) {
  const userRole = getUserRole();
  const headers = {
    'Content-Type': 'application/json',
    'x-admin-token': ADMIN_TOKEN,
  };
  
  if (userRole) {
    headers['x-user-role'] = userRole;
  }
  
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update article');
  }
  return res.json();
}

export async function deleteArticle(id) {
  const userRole = getUserRole();
  const headers = {
    'x-admin-token': ADMIN_TOKEN,
  };
  
  if (userRole) {
    headers['x-user-role'] = userRole;
  }
  
  const res = await fetch(`${BASE}/articles/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete article');
  }
  return res.json();
}
