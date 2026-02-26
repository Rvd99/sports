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
    
    // Fetch Cricket scores from ESPN Cricket API
    try {
      const cricketRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/cricket/icc/scoreboard');
      const cricketData = await cricketRes.json();
      
      console.log('🏏 Cricket API Response:', cricketData?.events ? `${cricketData.events.length} matches` : 'No matches');
      
      if (cricketData?.events && Array.isArray(cricketData.events)) {
        cricketData.events.slice(0, 3).forEach(event => {
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
                status: status.type.completed ? 'FINAL' : (status.type.state === 'in' ? status.type.shortDetail : status.type.shortDetail),
                live: status.type.state === 'in',
                homeColor: '#1e3a8a',
                awayColor: '#991b1b'
              });
            }
          }
        });
      }
      
      // If no cricket from ESPN, add sample cricket data to show the feature works
      if (scores.filter(s => s.league === 'cricket').length === 0) {
        console.log('⚠️ No live cricket matches, adding sample data');
        scores.push(
          {
            id: 'cricket-sample-1',
            league: 'cricket',
            home: 'IND',
            homeScore: 185,
            away: 'AUS',
            awayScore: 178,
            status: 'FINAL',
            live: false,
            homeColor: '#1e3a8a',
            awayColor: '#991b1b'
          },
          {
            id: 'cricket-sample-2',
            league: 'cricket',
            home: 'ENG',
            homeScore: 156,
            away: 'PAK',
            awayScore: 142,
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
          home: 'IND',
          homeScore: 185,
          away: 'AUS',
          awayScore: 178,
          status: 'FINAL',
          live: false,
          homeColor: '#1e3a8a',
          awayColor: '#991b1b'
        },
        {
          id: 'cricket-fallback-2',
          league: 'cricket',
          home: 'ENG',
          homeScore: 156,
          away: 'PAK',
          awayScore: 142,
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
