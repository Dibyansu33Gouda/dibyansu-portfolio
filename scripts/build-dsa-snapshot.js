// Builds data/dsa-progress.json from the DSA_practice_Dib repo's real commit
// history, using an authenticated GitHub token so it isn't subject to the
// 60-req/hour unauthenticated limit the client-side fetch in script.js runs
// under for visitors. Run via the scheduled workflow, or manually:
//   GITHUB_TOKEN=xxxx node scripts/build-dsa-snapshot.js
//
// This mirrors the client-side liveGitHubData() logic in script.js on purpose —
// if you change the ranking/streak logic there, update it here too.

const fs = require('fs');
const path = require('path');

const REPO = 'Dibyansu33Gouda/DSA_practice_Dib';
const TOKEN = process.env.GITHUB_TOKEN;
const API = 'https://api.github.com/repos/' + REPO;

function headers() {
  var h = { 'Accept': 'application/vnd.github+json', 'User-Agent': 'dsa-snapshot-script' };
  if (TOKEN) h['Authorization'] = 'Bearer ' + TOKEN;
  return h;
}

function dayKey(date) {
  return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
}

async function main() {
  var treeRes = await fetch(API + '/git/trees/HEAD?recursive=1', { headers: headers() });
  if (!treeRes.ok) throw new Error('Could not read solution files: ' + treeRes.status);
  var tree = (await treeRes.json()).tree || [];

  var commitsRes = await fetch(API + '/commits?per_page=100', { headers: headers() });
  if (!commitsRes.ok) throw new Error('Could not read solution commits: ' + commitsRes.status);
  var commits = await commitsRes.json();

  var files = tree.filter(function (item) {
    var p = item.path.toLowerCase();
    return item.type === 'blob' && !p.startsWith('.') && !/(^|\/)readme(\.|$)/.test(p) && p !== 'progress.json';
  });

  var byDay = {};
  commits.forEach(function (commit) {
    var date = ((commit.commit && commit.commit.author && commit.commit.author.date) || '').slice(0, 10);
    if (!date) return;
    if (!byDay[date]) byDay[date] = { date: date, count: 0, problems: [] };
    byDay[date].count++;
    byDay[date].problems.push({ name: (commit.commit.message || 'DSA solution').split('\n')[0], url: commit.html_url });
  });

  var dates = Object.keys(byDay).sort().reverse();
  var longest = 0, run = 0, previous = null;
  dates.slice().reverse().forEach(function (date) {
    var current = new Date(date + 'T00:00:00Z');
    if (previous && (current - previous) / 86400000 === 1) run++; else run = 1;
    if (run > longest) longest = run;
    previous = current;
  });

  var currentStreak = 0;
  if (dates.length) {
    var cursor = new Date(dates[0] + 'T00:00:00Z');
    for (var i = 0; i < dates.length; i++) {
      if (dates[i] !== dayKey(cursor)) break;
      currentStreak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  var snapshot = {
    updatedAt: new Date().toISOString(),
    roadmap: "Striver's A2Z DSA Sheet",
    profiles: {
      leetcode: 'https://leetcode.com/u/dibyansu_44/',
      takeUForward: 'https://takeuforward.org/profile/dibyansu_44',
      solutions: 'https://github.com/' + REPO
    },
    solved: files.length,
    currentStreak: currentStreak,
    longestStreak: longest,
    topics: [],
    activity: dates.map(function (date) { return byDay[date]; }),
    recent: commits.slice(0, 6).map(function (commit) {
      return {
        date: ((commit.commit.author && commit.commit.author.date) || '').slice(0, 10),
        name: (commit.commit.message || 'DSA solution').split('\n')[0],
        topic: 'DSA practice',
        url: commit.html_url
      };
    })
  };

  var outPath = path.join(__dirname, '..', 'data', 'dsa-progress.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Wrote', outPath, '—', files.length, 'solved,', currentStreak, 'day streak,', longest, 'longest.');
}

main().catch(function (err) {
  console.error('Snapshot build failed:', err.message);
  process.exit(1);
});
