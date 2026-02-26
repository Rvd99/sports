import express from 'express';
import cors from 'cors';
import slugify from 'slugify';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Serve static files from public/uploads
const uploadsDir = path.join(__dirname, '../public/uploads/articles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Configure multer for image uploads (using memory storage for sharp processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (will be compressed)
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Process and resize image to professional landscape format (16:9 ratio like Sportsnet.ca)
async function processArticleImage(buffer, filename) {
  const processedFilename = 'article-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
  const outputPath = path.join(uploadsDir, processedFilename);
  
  // Resize to 1200x675px (16:9 ratio) with smart cropping
  await sharp(buffer)
    .resize(1200, 675, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({
      quality: 85,
      progressive: true
    })
    .toFile(outputPath);
  
  return processedFilename;
}

// ─── In-memory data ───────────────────────────────────────────────────────────

const LEAGUE_COLORS = {
  nhl: '#0066cc', nba: '#c8102e', mlb: '#002d72',
  cfl: '#e03a3e', soccer: '#00a651', golf: '#2e7d32', tennis: '#f5a623',
  cricket: '#00a8cc', football: '#e8112d', kabaddi: '#ff6b35',
  ipl: '#4a90e2', isl: '#f39c12', other: '#888888',
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

let articles = [
  {
    id: 1,
    title: 'Lakers Dominate in Thrilling Game 7 Victory',
    slug: 'lakers-dominate-in-thrilling-game-7-victory',
    subheadline: 'LeBron James leads team to championship with 42-point performance',
    category: 'nba',
    categoryColor: LEAGUE_COLORS.nba,
    author: 'Michael Johnson',
    excerpt: 'In an electrifying Game 7 showdown, the Los Angeles Lakers secured their championship victory with a commanding performance led by LeBron James.',
    content: 'The Los Angeles Lakers delivered a masterclass performance in Game 7, with LeBron James putting on a show for the ages. The King scored 42 points, grabbed 11 rebounds, and dished out 8 assists in what many are calling one of the greatest playoff performances in NBA history.\n\nThe game was tight throughout the first three quarters, with neither team able to pull away. But in the fourth quarter, James took over, scoring 18 points and making several clutch plays on both ends of the floor.\n\n"This is what we worked for all season," James said in the post-game interview. "My teammates trusted me, and I just tried to make the right plays."\n\nAnthony Davis added 28 points and 12 rebounds, providing crucial support in the paint. The Lakers\' defense was also stellar, holding their opponents to just 38% shooting from the field.',
    imageUrl: 'https://picsum.photos/seed/lakers1/1200/675',
    imageFilename: null,
    tags: ['NBA', 'Lakers', 'LeBron James', 'Playoffs', 'Championship'],
    metaTitle: 'Lakers Win Championship: LeBron James Leads Game 7 Victory',
    metaDescription: 'LeBron James scores 42 points as Lakers dominate Game 7 to secure championship victory in thrilling playoff finale.',
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    publishDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isPublished: true,
    isFeatured: true,
    isTopStory: true,
    isTrending: true,
    isLatestNews: true,
    showOnHomepage: true,
    views: 15420
  },
  {
    id: 2,
    title: 'Maple Leafs Stun Rangers in Overtime Thriller',
    slug: 'maple-leafs-stun-rangers-in-overtime-thriller',
    subheadline: 'Auston Matthews nets game-winner at 3:42 of OT',
    category: 'nhl',
    categoryColor: LEAGUE_COLORS.nhl,
    author: 'Sarah Chen',
    excerpt: 'The Toronto Maple Leafs pulled off a stunning overtime victory against the New York Rangers at Madison Square Garden, with Auston Matthews scoring the decisive goal.',
    content: 'In front of a sold-out crowd at Madison Square Garden, the Toronto Maple Leafs delivered a playoff performance for the ages. Auston Matthews capped off a thrilling back-and-forth game with a spectacular overtime winner at 3:42 of the extra period.\n\nThe game featured six lead changes and some of the most intense hockey of the playoffs. Matthews finished with two goals and an assist, while Mitch Marner added three assists in the victory.\n\n"This is what playoff hockey is all about," Matthews said. "Both teams left everything on the ice tonight."\n\nGoaltender Ilya Samsonov was outstanding, making 38 saves including several highlight-reel stops in the third period to keep the Leafs in the game.',
    imageUrl: 'https://picsum.photos/seed/leafs1/1200/675',
    imageFilename: null,
    tags: ['NHL', 'Maple Leafs', 'Rangers', 'Playoffs', 'Overtime'],
    metaTitle: 'Maple Leafs Beat Rangers in OT: Matthews Scores Winner',
    metaDescription: 'Auston Matthews scores in overtime as Toronto Maple Leafs defeat New York Rangers in thrilling playoff matchup at MSG.',
    status: 'published',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    publishDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isPublished: true,
    isFeatured: false,
    isTopStory: true,
    isTrending: true,
    isLatestNews: true,
    showOnHomepage: true,
    views: 8930
  },
  {
    id: 3,
    title: 'Blue Jays Acquire All-Star Closer in Blockbuster Trade',
    slug: 'blue-jays-acquire-all-star-closer-in-blockbuster-trade',
    subheadline: 'Toronto bolsters bullpen with proven closer ahead of playoff push',
    category: 'mlb',
    categoryColor: LEAGUE_COLORS.mlb,
    author: 'Chris Brown',
    excerpt: 'The Toronto Blue Jays made a major splash at the trade deadline, acquiring three-time All-Star closer Marcus Rivera in a blockbuster deal.',
    content: 'The Toronto Blue Jays have made their intentions clear: they\'re going all-in for a championship run. In a stunning trade deadline move, the Jays acquired three-time All-Star closer Marcus Rivera from the Seattle Mariners.\n\nRivera, who has 28 saves and a 1.89 ERA this season, immediately becomes the Jays\' closer and gives them one of the most dominant late-game arms in baseball.\n\n"We\'re excited to add a pitcher of Marcus\'s caliber," said Blue Jays GM Ross Atkins. "He\'s a proven winner and exactly what we need for the stretch run."\n\nThe Blue Jays gave up two top prospects and a major league-ready pitcher in the deal, but the front office believes the move puts them in prime position to make a deep playoff run.',
    imageUrl: 'https://picsum.photos/seed/jays1/1200/675',
    imageFilename: null,
    tags: ['MLB', 'Blue Jays', 'Trade Deadline', 'Baseball'],
    metaTitle: 'Blue Jays Trade for All-Star Closer Marcus Rivera',
    metaDescription: 'Toronto Blue Jays acquire three-time All-Star closer Marcus Rivera in blockbuster trade deadline deal.',
    status: 'published',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    publishDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isPublished: true,
    isFeatured: false,
    isTopStory: false,
    isTrending: false,
    isLatestNews: true,
    showOnHomepage: true,
    views: 6240
  },
  {
    id: 4,
    title: 'Canada Qualifies for 2026 World Cup with Dramatic Winner',
    slug: 'canada-qualifies-for-2026-world-cup-with-dramatic-winner',
    subheadline: 'Alphonso Davies scores in stoppage time to send nation into frenzy',
    category: 'soccer',
    categoryColor: LEAGUE_COLORS.soccer,
    author: 'Emma Davis',
    excerpt: 'Alphonso Davies became a national hero as his stoppage-time goal secured Canada\'s qualification for the 2026 FIFA World Cup at a packed BMO Field.',
    content: 'BMO Field erupted in scenes of pure jubilation as Alphonso Davies scored in the 93rd minute to secure Canada\'s place in the 2026 FIFA World Cup. The Bayern Munich star\'s dramatic winner capped off a tense qualifying campaign and sent the entire nation into celebration.\n\nThe game looked destined for a draw until Davies received the ball on the left wing, cut inside, and unleashed a powerful shot into the top corner. The goal sparked wild celebrations both on the field and in the stands.\n\n"This is the greatest moment of my career," an emotional Davies said after the match. "To do this for Canada, in front of our fans, is something I\'ll never forget."\n\nCanada will co-host the 2026 World Cup alongside the United States and Mexico, and this qualification ensures they\'ll be part of the tournament on home soil.',
    imageUrl: 'https://picsum.photos/seed/canada1/1200/675',
    imageFilename: null,
    tags: ['Soccer', 'Canada', 'World Cup', 'Alphonso Davies'],
    metaTitle: 'Canada Qualifies for 2026 World Cup: Davies Scores Dramatic Winner',
    metaDescription: 'Alphonso Davies scores in stoppage time as Canada secures 2026 FIFA World Cup qualification with dramatic victory.',
    status: 'published',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    publishDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isPublished: true,
    isFeatured: true,
    isTopStory: true,
    isTrending: false,
    isLatestNews: true,
    showOnHomepage: true,
    views: 12850
  },
  {
    id: 5,
    title: 'Raptors Select French Phenom with 4th Overall Pick',
    slug: 'raptors-select-french-phenom-with-4th-overall-pick',
    subheadline: 'Toronto makes bold selection that could reshape franchise',
    category: 'nba',
    categoryColor: LEAGUE_COLORS.nba,
    author: 'Tom Williams',
    excerpt: 'The Toronto Raptors surprised many by selecting 19-year-old French forward Victor Beaumont with the 4th overall pick in the NBA Draft.',
    content: 'The Toronto Raptors made a statement with their draft selection, choosing 19-year-old French sensation Victor Beaumont with the 4th overall pick. The 6\'9" forward has drawn comparisons to some of the game\'s best two-way players.\n\nBeaumont averaged 18.5 points, 7.2 rebounds, and 3.8 assists per game in the French League last season, showcasing a rare combination of size, skill, and basketball IQ.\n\n"Victor is a special talent," said Raptors President Masai Ujiri. "He has the potential to be a cornerstone player for this franchise for years to come."\n\nThe selection represents a shift in the Raptors\' rebuilding strategy, focusing on young, international talent with high upside.',
    imageUrl: 'https://picsum.photos/seed/raptors1/1200/675',
    imageFilename: null,
    tags: ['NBA', 'Raptors', 'NBA Draft', 'Basketball'],
    metaTitle: 'Raptors Draft Victor Beaumont 4th Overall in NBA Draft',
    metaDescription: 'Toronto Raptors select French forward Victor Beaumont with 4th pick in NBA Draft, making bold move for future.',
    status: 'draft',
    publishedAt: null,
    publishDate: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isPublished: false,
    isFeatured: false,
    isTopStory: false,
    isTrending: false,
    isLatestNews: false,
    showOnHomepage: false,
    views: 0
  }
];
let articleIdCounter = 6;

// ─── Admin Authentication Middleware ──────────────────────────────────────────

const adminAuth = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];
  const userRole = req.headers['x-user-role'];
  
  // For now, accept both token-based and role-based auth
  // In production, this should be proper JWT validation
  if (adminToken === 'admin-secret-token') {
    req.user = { role: 'admin', name: 'Admin User' };
    next();
  } else if (userRole === 'admin' || userRole === 'editor') {
    req.user = { role: userRole, name: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} User` };
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin or Editor access required' });
  }
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function generateSlug(title) {
  return slugify(title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

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

// ─── Article Routes ───────────────────────────────────────────────────────────

app.get('/api/articles', (req, res) => {
  const { category, limit, homepage } = req.query;
  let filtered = articles.filter(a => a.isPublished);
  
  // Filter by showOnHomepage if homepage=true is passed
  if (homepage === 'true') {
    filtered = filtered.filter(a => a.showOnHomepage !== false);
  }
  
  if (category && category !== 'all') {
    filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  
  filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }
  
  res.json(filtered);
});

app.get('/api/articles/:identifier', (req, res) => {
  const { identifier } = req.params;
  const article = articles.find(a => 
    a.slug === identifier || a.id === parseInt(identifier)
  );
  
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  if (!article.isPublished) {
    return res.status(403).json({ error: 'Article not published' });
  }
  
  res.json(article);
});

app.post('/api/articles', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { 
      title, category, excerpt, content, tags, isPublished,
      isFeatured, isTopStory, isTrending, isLatestNews,
      subheadline, metaTitle, metaDescription, status, publishDate, customSlug,
      showOnHomepage
    } = req.body;
    
    if (!title || !category || !excerpt) {
      return res.status(400).json({ 
        error: 'title, category, and excerpt are required' 
      });
    }
    
    // Use custom slug if provided, otherwise generate from title
    const slug = customSlug ? slugify(customSlug, { lower: true, strict: true }) : generateSlug(title);
    const existingSlug = articles.find(a => a.slug === slug);
    
    if (existingSlug) {
      return res.status(400).json({ 
        error: 'An article with this slug already exists' 
      });
    }
    
    const categoryKey = category.toLowerCase();
    const now = new Date().toISOString();
    
    // Process and resize image to professional landscape format
    let imageUrl;
    let imageFilename = null;
    if (req.file) {
      const processedFilename = await processArticleImage(req.file.buffer, req.file.originalname);
      imageUrl = `http://localhost:${PORT}/uploads/articles/${processedFilename}`;
      imageFilename = processedFilename;
    } else {
      imageUrl = `https://picsum.photos/seed/article${Date.now()}/1200/675`;
    }
    
    // Determine publish date
    const articleStatus = status || 'published';
    const finalPublishDate = publishDate || (articleStatus === 'published' ? now : null);
    
    const newArticle = {
      id: articleIdCounter++,
      title,
      slug,
      subheadline: subheadline || '',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt.substring(0, 160),
      category: categoryKey,
      categoryColor: LEAGUE_COLORS[categoryKey] || LEAGUE_COLORS.other,
      author: req.user.name || 'Admin',
      excerpt: excerpt.substring(0, 200),
      content: content || '',
      imageUrl,
      imageFilename,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
      status: articleStatus,
      publishedAt: finalPublishDate,
      publishDate: finalPublishDate,
      createdAt: now,
      updatedAt: now,
      isPublished: articleStatus === 'published',
      // Placement options
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isTopStory: isTopStory === 'true' || isTopStory === true,
      isTrending: isTrending === 'true' || isTrending === true,
      isLatestNews: isLatestNews === 'true' || isLatestNews === true,
      showOnHomepage: showOnHomepage === undefined ? true : (showOnHomepage === 'true' || showOnHomepage === true),
      views: 0,
    };
    
    articles.unshift(newArticle);
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to process article image' });
  }
});

app.put('/api/articles/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const articleIndex = articles.findIndex(a => a.id === parseInt(id));
  
  if (articleIndex === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  const { 
    title, category, excerpt, content, imageUrl, tags, isPublished,
    status, subheadline, metaTitle, metaDescription, publishDate,
    isFeatured, isTopStory, isTrending, isLatestNews, showOnHomepage
  } = req.body;
  const article = articles[articleIndex];
  
  if (title && title !== article.title) {
    const newSlug = generateSlug(title);
    const existingSlug = articles.find(a => a.slug === newSlug && a.id !== article.id);
    if (existingSlug) {
      return res.status(400).json({ error: 'An article with this title already exists' });
    }
    article.title = title;
    article.slug = newSlug;
  }
  
  if (category) {
    const categoryKey = category.toLowerCase();
    article.category = categoryKey;
    article.categoryColor = LEAGUE_COLORS[categoryKey] || LEAGUE_COLORS.other;
  }
  
  if (excerpt) article.excerpt = excerpt.substring(0, 200);
  if (content !== undefined) article.content = content;
  if (imageUrl !== undefined) article.imageUrl = imageUrl;
  if (tags !== undefined) {
    article.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);
  }
  if (isPublished !== undefined) article.isPublished = isPublished;
  
  // Update new fields
  if (status !== undefined) {
    article.status = status;
    article.isPublished = status === 'published';
    if (status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date().toISOString();
    }
  }
  if (subheadline !== undefined) article.subheadline = subheadline;
  if (metaTitle !== undefined) article.metaTitle = metaTitle;
  if (metaDescription !== undefined) article.metaDescription = metaDescription;
  if (publishDate !== undefined) article.publishDate = publishDate;
  if (isFeatured !== undefined) article.isFeatured = isFeatured;
  if (isTopStory !== undefined) article.isTopStory = isTopStory;
  if (isTrending !== undefined) article.isTrending = isTrending;
  if (isLatestNews !== undefined) article.isLatestNews = isLatestNews;
  if (showOnHomepage !== undefined) article.showOnHomepage = showOnHomepage;
  
  article.updatedAt = new Date().toISOString();
  
  res.json(article);
});

app.delete('/api/articles/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const articleIndex = articles.findIndex(a => a.id === parseInt(id));
    
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    const article = articles[articleIndex];
    
    // Delete associated image file if it exists
    if (article.imageFilename) {
      const imagePath = path.join(uploadsDir, article.imageFilename);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image file: ${article.imageFilename}`);
        }
      } catch (err) {
        console.error(`Failed to delete image file: ${err.message}`);
        // Continue with article deletion even if image deletion fails
      }
    }
    
    articles.splice(articleIndex, 1);
    res.json({ message: 'Article deleted successfully', deletedArticle: { id: article.id, title: article.title } });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

app.listen(PORT, () => {
  console.log(`\nDEGEN Sports API running at http://localhost:${PORT}\n`);
});
