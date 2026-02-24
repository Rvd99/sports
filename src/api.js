const BASE = 'http://localhost:5001/api';

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
