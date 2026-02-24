import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// ─── In-memory data ───────────────────────────────────────────────────────────

const LEAGUE_COLORS = {
  nhl: '#0066cc', nba: '#c8102e', mlb: '#002d72',
  cfl: '#e03a3e', soccer: '#00a651', golf: '#2e7d32', tennis: '#f5a623',
};

let news = [
  { id: 1, league: 'nhl', leagueColor: '#0066cc', headline: 'Connor McDavid Named Hart Trophy Finalist for Record Fifth Time', excerpt: 'The Oilers captain continues to rewrite the record books after a historic 150-point season.', image: 'https://picsum.photos/seed/nhl1/600/400', author: 'Mike Johnson', time: '1 hour ago', featured: true },
  { id: 2, league: 'nhl', leagueColor: '#0066cc', headline: 'Maple Leafs Stun Rangers in OT Thriller to Take Series Lead', excerpt: 'Auston Matthews nets the game-winner at 3:42 of OT in a sold-out Madison Square Garden.', image: 'https://picsum.photos/seed/nhl2/600/400', author: 'Sarah Chen', time: '2 hours ago' },
  { id: 3, league: 'nhl', leagueColor: '#0066cc', headline: 'Senators Fire Head Coach After Five-Game Losing Streak', excerpt: 'The organization parts ways with the bench boss following a disappointing stretch of play.', image: 'https://picsum.photos/seed/nhl3/600/400', author: 'Tom Williams', time: '3 hours ago' },
  { id: 4, league: 'nhl', leagueColor: '#0066cc', headline: 'Leafs Sign Defenceman to Five-Year Extension Worth $35M', excerpt: 'The deal keeps the blue-liner in Toronto through the prime years of his career.', image: 'https://picsum.photos/seed/nhl4/600/400', author: 'Chris Brown', time: '4 hours ago' },
  { id: 5, league: 'nhl', leagueColor: '#0066cc', headline: 'Oilers Clinch Division Title with Dominant Road Win', excerpt: 'Edmonton locks up the Pacific Division crown with a convincing performance on the road.', image: 'https://picsum.photos/seed/nhl5/600/400', author: 'Lisa Park', time: '5 hours ago' },
  { id: 6, league: 'nba', leagueColor: '#c8102e', headline: 'Shai Gilgeous-Alexander Wins NBA MVP in Landslide Vote', excerpt: 'The Thunder star becomes the first Canadian-born player to win the award.', image: 'https://picsum.photos/seed/nba1/600/400', author: 'Emma Davis', time: '2 hours ago', featured: true },
  { id: 7, league: 'nba', leagueColor: '#c8102e', headline: 'LeBron James Drops 42 Points as Lakers Clinch West Finals Spot', excerpt: 'The King delivers a masterclass performance in a must-win Game 6 on the road.', image: 'https://picsum.photos/seed/nba2/600/400', author: 'Mike Johnson', time: '4 hours ago' },
  { id: 8, league: 'nba', leagueColor: '#c8102e', headline: 'Raptors Select French Phenom with 4th Overall Pick in NBA Draft', excerpt: 'Toronto makes a bold selection that could reshape the franchise for years to come.', image: 'https://picsum.photos/seed/nba3/600/400', author: 'Sarah Chen', time: '6 hours ago' },
  { id: 9, league: 'nba', leagueColor: '#c8102e', headline: 'Warriors Announce Klay Thompson Retirement Ceremony Date', excerpt: 'The Golden State organization will honour the five-time champion in a special ceremony.', image: 'https://picsum.photos/seed/nba4/600/400', author: 'Tom Williams', time: '8 hours ago' },
  { id: 10, league: 'mlb', leagueColor: '#002d72', headline: 'Blue Jays Acquire All-Star Closer in Blockbuster Trade Deadline Deal', excerpt: 'Toronto bolsters its bullpen with a proven closer as the team makes a serious push for the postseason.', image: 'https://picsum.photos/seed/mlb1/600/400', author: 'Chris Brown', time: '3 hours ago', featured: true },
  { id: 11, league: 'mlb', leagueColor: '#002d72', headline: 'Blue Jays Walk Off Yankees in Extra Innings to Stay Alive', excerpt: 'Vladimir Guerrero Jr. crushes a three-run homer in the 11th to complete the comeback.', image: 'https://picsum.photos/seed/mlb2/600/400', author: 'Lisa Park', time: '5 hours ago' },
  { id: 12, league: 'mlb', leagueColor: '#002d72', headline: 'Shohei Ohtani Hits 30th Homer of Season in Dodgers Win', excerpt: 'The two-way superstar continues his historic campaign with another jaw-dropping performance.', image: 'https://picsum.photos/seed/mlb3/600/400', author: 'Emma Davis', time: '7 hours ago' },
  { id: 13, league: 'cfl', leagueColor: '#e03a3e', headline: 'Winnipeg Blue Bombers Dominate Grey Cup Rematch in Season Opener', excerpt: 'Zach Collaros throws for 320 yards and 3 TDs in a commanding 34-17 victory.', image: 'https://picsum.photos/seed/cfl1/600/400', author: 'Mike Johnson', time: '4 hours ago', featured: true },
  { id: 14, league: 'cfl', leagueColor: '#e03a3e', headline: 'Grey Cup Tickets Sell Out in Record 12 Minutes as Host City Announced', excerpt: 'Demand for the 111th Grey Cup reaches unprecedented levels as fans scramble for seats.', image: 'https://picsum.photos/seed/cfl2/600/400', author: 'Sarah Chen', time: '6 hours ago' },
  { id: 15, league: 'cfl', leagueColor: '#e03a3e', headline: 'Riders Release Veteran Quarterback After Contract Dispute', excerpt: 'The Saskatchewan Roughriders part ways with their long-time starter in a surprise move.', image: 'https://picsum.photos/seed/cfl3/600/400', author: 'Tom Williams', time: '8 hours ago' },
  { id: 16, league: 'soccer', leagueColor: '#00a651', headline: 'Canada Qualifies for 2026 World Cup with Dramatic Last-Minute Winner', excerpt: 'Alphonso Davies scores in stoppage time to send a nation into a frenzy at BMO Field.', image: 'https://picsum.photos/seed/soccer1/600/400', author: 'Chris Brown', time: '6 hours ago', featured: true },
  { id: 17, league: 'soccer', leagueColor: '#00a651', headline: 'TFC Signs Designated Player in Club-Record Transfer', excerpt: 'Toronto FC makes a statement signing as the club looks to return to MLS Cup contention.', image: 'https://picsum.photos/seed/soccer2/600/400', author: 'Lisa Park', time: '8 hours ago' },
  { id: 18, league: 'soccer', leagueColor: '#00a651', headline: 'Canada Women Advance to Olympic Gold Medal Match', excerpt: 'The Canadian women\'s team delivers a stunning semifinal performance to reach the final.', image: 'https://picsum.photos/seed/soccer3/600/400', author: 'Emma Davis', time: '10 hours ago' },
  { id: 19, league: 'golf', leagueColor: '#2e7d32', headline: 'Corey Conners Shoots 63 to Lead Canadian Open After Round Two', excerpt: "Canada's top golfer is in prime position to claim his home country's biggest tournament.", image: 'https://picsum.photos/seed/golf1/600/400', author: 'Mike Johnson', time: '5 hours ago', featured: true },
  { id: 20, league: 'golf', leagueColor: '#2e7d32', headline: 'Rory McIlroy Completes Career Grand Slam at Augusta', excerpt: 'The Northern Irishman finally captures the elusive Masters title in a dramatic final round.', image: 'https://picsum.photos/seed/golf2/600/400', author: 'Sarah Chen', time: '9 hours ago' },
  { id: 21, league: 'tennis', leagueColor: '#f5a623', headline: 'Bianca Andreescu Returns to Top 20 After Injury Comeback', excerpt: 'The Canadian star shows she is back to her best with a dominant clay court performance.', image: 'https://picsum.photos/seed/tennis1/600/400', author: 'Tom Williams', time: '7 hours ago', featured: true },
  { id: 22, league: 'tennis', leagueColor: '#f5a623', headline: 'Felix Auger-Aliassime Reaches First Grand Slam Final', excerpt: 'The Montreal native delivers the performance of his career to reach the Roland Garros final.', image: 'https://picsum.photos/seed/tennis2/600/400', author: 'Chris Brown', time: '11 hours ago' },
];

let scores = [
  { id: 1, league: 'nhl', home: 'TOR', homeScore: 3, away: 'NYR', awayScore: 2, status: 'FINAL/OT', homeColor: '#00205b', awayColor: '#0038a8', live: false },
  { id: 2, league: 'nhl', home: 'EDM', homeScore: 5, away: 'VAN', awayScore: 1, status: 'FINAL', homeColor: '#041e42', awayColor: '#00843d', live: false },
  { id: 3, league: 'nhl', home: 'MTL', homeScore: 2, away: 'OTT', awayScore: 1, status: 'P2 14:22', homeColor: '#af1e2d', awayColor: '#c52032', live: true },
  { id: 4, league: 'nhl', home: 'CGY', homeScore: 0, away: 'WPG', awayScore: 0, status: '9:00 PM ET', homeColor: '#c8102e', awayColor: '#003087', live: false, upcoming: true },
  { id: 5, league: 'nba', home: 'BOS', homeScore: 98, away: 'MIA', awayScore: 101, status: 'Q4 2:34', homeColor: '#007a33', awayColor: '#98002e', live: true },
  { id: 6, league: 'nba', home: 'LAL', homeScore: 112, away: 'GSW', awayScore: 108, status: 'FINAL', homeColor: '#552583', awayColor: '#1d428a', live: false },
  { id: 7, league: 'nba', home: 'DEN', homeScore: 0, away: 'OKC', awayScore: 0, status: '9:30 PM ET', homeColor: '#0e2240', awayColor: '#007ac1', live: false, upcoming: true },
  { id: 8, league: 'mlb', home: 'TOR', homeScore: 7, away: 'NYY', awayScore: 4, status: 'FINAL', homeColor: '#134a8e', awayColor: '#003087', live: false },
  { id: 9, league: 'mlb', home: 'LAD', homeScore: 3, away: 'SF', awayScore: 3, status: 'BOT 7th', homeColor: '#005a9c', awayColor: '#fd5a1e', live: true },
  { id: 10, league: 'mlb', home: 'CHC', homeScore: 0, away: 'STL', awayScore: 0, status: '7:05 PM ET', homeColor: '#0e3386', awayColor: '#c41e3a', live: false, upcoming: true },
  { id: 11, league: 'cfl', home: 'WPG', homeScore: 34, away: 'CGY', awayScore: 17, status: 'FINAL', homeColor: '#003087', awayColor: '#c8102e', live: false },
  { id: 12, league: 'cfl', home: 'TOR', homeScore: 21, away: 'OTT', awayScore: 14, status: 'Q3 5:12', homeColor: '#003087', awayColor: '#4d1979', live: true },
  { id: 13, league: 'soccer', home: 'TFC', homeScore: 2, away: 'MTL', awayScore: 0, status: 'FINAL', homeColor: '#c8102e', awayColor: '#005baa', live: false },
  { id: 14, league: 'soccer', home: 'VAN', homeScore: 1, away: 'SEA', awayScore: 1, status: '72\'', homeColor: '#00245d', awayColor: '#005695', live: true },
];

let videos = [
  { id: 1, league: 'nhl', leagueColor: '#0066cc', title: 'Matthews OT Winner — Full Highlight Package', thumb: 'https://picsum.photos/seed/vnhl1/600/340', duration: '4:32', views: '248K', time: '2 hours ago' },
  { id: 2, league: 'nhl', leagueColor: '#0066cc', title: 'Top 10 Saves of the Week — NHL Highlights', thumb: 'https://picsum.photos/seed/vnhl2/600/340', duration: '3:28', views: '320K', time: '5 hours ago' },
  { id: 3, league: 'nhl', leagueColor: '#0066cc', title: 'McDavid Hat Trick — Every Goal in Slow Motion', thumb: 'https://picsum.photos/seed/vnhl3/600/340', duration: '5:10', views: '510K', time: '8 hours ago' },
  { id: 4, league: 'nba', leagueColor: '#c8102e', title: "LeBron's 42-Point Masterclass — Every Bucket", thumb: 'https://picsum.photos/seed/vnba1/600/340', duration: '6:18', views: '1.2M', time: '4 hours ago' },
  { id: 5, league: 'nba', leagueColor: '#c8102e', title: 'SGA MVP Highlights — Best Plays of the Season', thumb: 'https://picsum.photos/seed/vnba2/600/340', duration: '7:45', views: '890K', time: '6 hours ago' },
  { id: 6, league: 'nba', leagueColor: '#c8102e', title: 'Top 10 Dunks of the Week — NBA Highlights', thumb: 'https://picsum.photos/seed/vnba3/600/340', duration: '3:55', views: '650K', time: '9 hours ago' },
  { id: 7, league: 'mlb', leagueColor: '#002d72', title: "Guerrero Jr.'s Walk-Off Homer — Full Reaction", thumb: 'https://picsum.photos/seed/vmlb1/600/340', duration: '3:47', views: '412K', time: '8 hours ago' },
  { id: 8, league: 'mlb', leagueColor: '#002d72', title: 'Ohtani Pitching & Hitting — Best of Both Worlds', thumb: 'https://picsum.photos/seed/vmlb2/600/340', duration: '5:22', views: '780K', time: '10 hours ago' },
  { id: 9, league: 'cfl', leagueColor: '#e03a3e', title: 'Collaros 3-TD Performance — Best Plays', thumb: 'https://picsum.photos/seed/vcfl1/600/340', duration: '5:12', views: '156K', time: '10 hours ago' },
  { id: 10, league: 'soccer', leagueColor: '#00a651', title: "Davies' World Cup Qualifier Goal — Slow Motion", thumb: 'https://picsum.photos/seed/vsoccer1/600/340', duration: '2:05', views: '890K', time: '6 hours ago' },
  { id: 11, league: 'golf', leagueColor: '#2e7d32', title: 'Conners 63 — Every Shot from Round 2', thumb: 'https://picsum.photos/seed/vgolf1/600/340', duration: '8:14', views: '95K', time: '5 hours ago' },
  { id: 12, league: 'tennis', leagueColor: '#f5a623', title: 'Andreescu Best Points — Comeback Win Highlights', thumb: 'https://picsum.photos/seed/vtennis1/600/340', duration: '4:30', views: '210K', time: '7 hours ago' },
];

let posts = [];

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/news', (req, res) => {
  const { league } = req.query;
  const allNews = [...news, ...posts.map(p => ({ ...p, isPost: true }))];
  if (league && league !== 'all') {
    return res.json(allNews.filter(n => n.league === league.toLowerCase()));
  }
  res.json(allNews);
});

app.get('/api/scores', (req, res) => {
  const { league } = req.query;
  if (league && league !== 'all') {
    return res.json(scores.filter(s => s.league === league.toLowerCase()));
  }
  res.json(scores);
});

app.get('/api/videos', (req, res) => {
  const { league } = req.query;
  if (league && league !== 'all') {
    return res.json(videos.filter(v => v.league === league.toLowerCase()));
  }
  res.json(videos);
});

app.get('/api/posts', (req, res) => {
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const { title, excerpt, content, league, image } = req.body;
  if (!title || !excerpt || !league) {
    return res.status(400).json({ error: 'title, excerpt, and league are required' });
  }
  const leagueKey = league.toLowerCase();
  const seed = `post${Date.now()}`;
  const newPost = {
    id: Date.now(),
    league: leagueKey,
    leagueColor: LEAGUE_COLORS[leagueKey] || '#888',
    headline: title,
    excerpt,
    content: content || '',
    image: image || `https://picsum.photos/seed/${seed}/600/400`,
    author: 'Admin',
    time: 'Just now',
    createdAt: new Date().toISOString(),
    featured: false,
  };
  posts.unshift(newPost);
  res.status(201).json(newPost);
});

app.listen(PORT, () => {
  console.log(`\nDEGEN Sports API running at http://localhost:${PORT}\n`);
});
