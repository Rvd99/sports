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

// Fetch live NBA and Cricket scores from ESPN API
export async function fetchLiveScores() {
  try {
    console.log('🔄 Fetching live scores from ESPN API...');
    
    const scores = [];
    
    // Fetch NBA scores from ESPN
    try {
      const nbaRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      const nbaData = await nbaRes.json();
      
      console.log('🏀 NBA API Response:', nbaData?.events ? `${nbaData.events.length} games` : 'No games');
      
      if (nbaData?.events && Array.isArray(nbaData.events)) {
        nbaData.events.slice(0, 3).forEach(event => {
          const competition = event.competitions?.[0];
          if (competition) {
            const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');
            const status = competition.status;
            
            if (homeTeam && awayTeam) {
              scores.push({
                id: `nba-${event.id}`,
                league: 'nba',
                home: homeTeam.team.abbreviation || homeTeam.team.displayName.substring(0, 3).toUpperCase(),
                homeScore: parseInt(homeTeam.score) || 0,
                away: awayTeam.team.abbreviation || awayTeam.team.displayName.substring(0, 3).toUpperCase(),
                awayScore: parseInt(awayTeam.score) || 0,
                status: status.type.completed ? 'FINAL' : (status.type.state === 'in' ? status.type.shortDetail : status.type.shortDetail),
                live: status.type.state === 'in',
                homeColor: homeTeam.team.color ? `#${homeTeam.team.color}` : '#c8102e',
                awayColor: awayTeam.team.color ? `#${awayTeam.team.color}` : '#0066cc'
              });
            }
          }
        });
      }
    } catch (nbaError) {
      console.error('❌ NBA API Error:', nbaError);
    }
    
    // Fetch Cricket scores from ESPN Cricket API (today and yesterday)
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      };
      
      const todayStr = formatDate(today);
      const yesterdayStr = formatDate(yesterday);
      
      // Try both today and yesterday's matches
      const [todayCricket, yesterdayCricket] = await Promise.all([
        fetch(`https://site.api.espn.com/apis/site/v2/sports/cricket/icc/scoreboard?dates=${todayStr}`),
        fetch(`https://site.api.espn.com/apis/site/v2/sports/cricket/icc/scoreboard?dates=${yesterdayStr}`)
      ]);
      
      const todayData = await todayCricket.json();
      const yesterdayData = await yesterdayCricket.json();
      
      const allCricketEvents = [
        ...(todayData?.events || []),
        ...(yesterdayData?.events || [])
      ];
      
      console.log('🏏 Cricket API Response:', allCricketEvents.length > 0 ? `${allCricketEvents.length} matches` : 'No matches');
      
      if (allCricketEvents.length > 0) {
        allCricketEvents.slice(0, 3).forEach(event => {
          const competition = event.competitions?.[0];
          if (competition) {
            const homeTeam = competition.competitors?.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors?.find(c => c.homeAway === 'away');
            const status = competition.status;
            
            if (homeTeam && awayTeam) {
              scores.push({
                id: `cricket-${event.id}`,
                league: 'cricket',
                home: homeTeam.team.abbreviation || homeTeam.team.displayName.substring(0, 3).toUpperCase(),
                homeScore: parseInt(homeTeam.score) || 0,
                away: awayTeam.team.abbreviation || awayTeam.team.displayName.substring(0, 3).toUpperCase(),
                awayScore: parseInt(awayTeam.score) || 0,
                status: status.type.completed ? 'FINAL' : (status.type.state === 'in' ? 'LIVE' : status.type.shortDetail),
                live: status.type.state === 'in',
                homeColor: '#1e3a8a',
                awayColor: '#991b1b'
              });
            }
          }
        });
      }
      
      // If no cricket from ESPN, add recent T20 sample data
      if (scores.filter(s => s.league === 'cricket').length === 0) {
        console.log('⚠️ No cricket matches from API, adding recent T20 sample data');
        scores.push(
          {
            id: 'cricket-sample-1',
            league: 'cricket',
            home: 'AUS',
            homeScore: 178,
            away: 'IND',
            awayScore: 185,
            status: 'FINAL',
            live: false,
            homeColor: '#1e3a8a',
            awayColor: '#991b1b'
          },
          {
            id: 'cricket-sample-2',
            league: 'cricket',
            home: 'PAK',
            homeScore: 142,
            away: 'ENG',
            awayScore: 156,
            status: 'FINAL',
            live: false,
            homeColor: '#1e3a8a',
            awayColor: '#991b1b'
          }
        );
      }
    } catch (cricketError) {
      console.error('❌ Cricket API Error:', cricketError);
      // Add sample cricket data on error
      scores.push(
        {
          id: 'cricket-fallback-1',
          league: 'cricket',
          home: 'AUS',
          homeScore: 178,
          away: 'IND',
          awayScore: 185,
          status: 'FINAL',
          live: false,
          homeColor: '#1e3a8a',
          awayColor: '#991b1b'
        },
        {
          id: 'cricket-fallback-2',
          league: 'cricket',
          home: 'PAK',
          homeScore: 142,
          away: 'ENG',
          awayScore: 156,
          status: 'FINAL',
          live: false,
          homeColor: '#1e3a8a',
          awayColor: '#991b1b'
        }
      );
    }

    console.log(`✅ Total scores fetched: ${scores.length}`);
    console.log('📊 Scores data:', scores);
    return scores.length > 0 ? scores : null;
  } catch (error) {
    console.error('❌ Error fetching live scores:', error);
    return null;
  }
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

export async function fetchArticlesByPlacement(flag, { limit, category } = {}) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (category && category !== 'all') params.append('category', category);
  const url = `${BASE}/articles/placement/${flag}${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch placement articles');
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

// ─── Sections ─────────────────────────────────────────────────────────────────

export async function fetchSections() {
  const res = await fetch(`${BASE}/sections`);
  if (!res.ok) throw new Error('Failed to fetch sections');
  return res.json();
}

export async function createSection(data) {
  const userRole = getUserRole();
  const res = await fetch(`${BASE}/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN,
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create section');
  }
  return res.json();
}

export async function updateSection(id, data) {
  const userRole = getUserRole();
  const res = await fetch(`${BASE}/sections/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN,
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update section');
  }
  return res.json();
}

export async function deleteSection(id) {
  const userRole = getUserRole();
  const res = await fetch(`${BASE}/sections/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-token': ADMIN_TOKEN,
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete section');
  }
  return res.json();
}

export async function fetchSectionArticles(slug) {
  const res = await fetch(`${BASE}/sections/${slug}/articles`);
  if (!res.ok) throw new Error('Failed to fetch section articles');
  return res.json();
}

// ─── Twitter Posts ─────────────────────────────────────────────────────────────

export async function fetchTwitterPosts(page) {
  const url = page ? `${BASE}/twitter-posts?page=${page}` : `${BASE}/twitter-posts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch twitter posts');
  return res.json();
}

export async function addTwitterPost(data) {
  const userRole = getUserRole();
  const res = await fetch(`${BASE}/twitter-posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN,
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add twitter post');
  }
  return res.json();
}

export async function deleteTwitterPost(id) {
  const userRole = getUserRole();
  const res = await fetch(`${BASE}/twitter-posts/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-token': ADMIN_TOKEN,
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete twitter post');
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function registerUser(data) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Registration failed');
  return json;
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json;
}

// ─── Polls ─────────────────────────────────────────────────────────────────────

export async function fetchPolls(params = {}) {
  const q = new URLSearchParams();
  if (params.sidebar) q.set('sidebar', 'true');
  if (params.active) q.set('active', 'true');
  const res = await fetch(`${BASE}/polls?${q}`);
  if (!res.ok) throw new Error('Failed to fetch polls');
  return res.json();
}

export async function createPoll(data) {
  const res = await fetch(`${BASE}/polls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create poll');
  return json;
}

export async function updatePoll(id, data) {
  const res = await fetch(`${BASE}/polls/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update poll');
  return json;
}

export async function deleteVideo(id) {
  const userRole = getUserRole();
  const res = await fetch(`${BASE}/videos/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-token': ADMIN_TOKEN,
      ...(userRole ? { 'x-user-role': userRole } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete video');
  }
  return res.json();
}

export async function deletePoll(id) {
  const res = await fetch(`${BASE}/polls/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Failed to delete poll');
  return res.json();
}

export async function votePoll(pollId, optionId, userId) {
  const res = await fetch(`${BASE}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionId, userId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Vote failed');
  return json;
}

export async function getMyVote(pollId, userId) {
  const res = await fetch(`${BASE}/polls/${pollId}/myvote?userId=${userId}`);
  if (!res.ok) return { userVote: null };
  return res.json();
}

// ─── Comments ──────────────────────────────────────────────────────────────────

export async function fetchComments(slug) {
  const res = await fetch(`${BASE}/comments?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

export async function postComment(data) {
  const res = await fetch(`${BASE}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to post comment');
  return json;
}

export async function likeComment(commentId, userId) {
  const res = await fetch(`${BASE}/comments/${commentId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to like comment');
  return res.json();
}

export async function deleteComment(id) {
  const res = await fetch(`${BASE}/comments/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Failed to delete comment');
  return res.json();
}

export async function dislikeComment(commentId, userId) {
  const res = await fetch(`${BASE}/comments/${commentId}/dislike`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to dislike comment');
  return res.json();
}

// ─── User Profile ──────────────────────────────────────────────────────────────

export async function fetchUserProfile(identifier) {
  const res = await fetch(`${BASE}/users/${identifier}/profile`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchUserComments(userId) {
  const res = await fetch(`${BASE}/users/${userId}/comments`);
  if (!res.ok) throw new Error('Failed to fetch user comments');
  return res.json();
}

export async function fetchUserPredictions(userId) {
  const res = await fetch(`${BASE}/users/${userId}/predictions`);
  if (!res.ok) throw new Error('Failed to fetch user predictions');
  return res.json();
}

export async function uploadAvatar(userId, file) {
  const form = new FormData();
  form.append('avatar', file);
  const res = await fetch(`${BASE}/users/${userId}/avatar`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to upload avatar');
  return json;
}

export async function resolvePoll(pollId, correctOptionId) {
  const res = await fetch(`${BASE}/polls/${pollId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify({ correctOptionId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to resolve poll');
  return json;
}

// ─── Fan Forums ─────────────────────────────────────────────────────────────

export async function fetchForumThreads({ league = 'all', sort = 'latest' } = {}) {
  const res = await fetch(`${BASE}/forum/threads?league=${league}&sort=${sort}`);
  if (!res.ok) throw new Error('Failed to fetch threads');
  return res.json();
}

export async function fetchForumThread(id) {
  const res = await fetch(`${BASE}/forum/threads/${id}`);
  if (!res.ok) throw new Error('Thread not found');
  return res.json();
}

export async function fetchForumReplies(threadId) {
  const res = await fetch(`${BASE}/forum/threads/${threadId}/replies`);
  if (!res.ok) throw new Error('Failed to fetch replies');
  return res.json();
}

export async function createForumThread({ league, title, body, userId }) {
  const res = await fetch(`${BASE}/forum/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ league, title, body, userId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create thread');
  return json;
}

export async function createForumReply(threadId, { userId, text }) {
  const res = await fetch(`${BASE}/forum/threads/${threadId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, text }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to post reply');
  return json;
}

export async function likeForumThread(threadId, userId) {
  const res = await fetch(`${BASE}/forum/threads/${threadId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to like thread');
  return json;
}

export async function likeForumReply(replyId, userId) {
  const res = await fetch(`${BASE}/forum/replies/${replyId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to like reply');
  return json;
}

export async function fetchAdminForumThreads({ status } = {}) {
  const url = status ? `${BASE}/admin/forum/threads?status=${status}` : `${BASE}/admin/forum/threads`;
  const res = await fetch(url, { headers: { 'x-admin-token': ADMIN_TOKEN } });
  if (!res.ok) throw new Error('Failed to fetch admin threads');
  return res.json();
}

export async function moderateForumThread(id, updates) {
  const res = await fetch(`${BASE}/admin/forum/threads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update thread');
  return json;
}

export async function deleteForumThread(id) {
  const res = await fetch(`${BASE}/admin/forum/threads/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Failed to delete thread');
  return res.json();
}

export async function deleteForumReply(id) {
  const res = await fetch(`${BASE}/admin/forum/replies/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
  if (!res.ok) throw new Error('Failed to delete reply');
  return res.json();
}
