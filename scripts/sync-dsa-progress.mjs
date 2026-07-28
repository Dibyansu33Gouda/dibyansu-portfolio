import { writeFile } from 'node:fs/promises';

const sourceUrl = process.env.DSA_SOURCE_URL;

if (!sourceUrl) {
  console.log('DSA_SOURCE_URL is not configured; keeping the current tracker data.');
  process.exit(0);
}

const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'dibyansu-portfolio-dsa-sync' } });
if (!response.ok) throw new Error(`Could not download DSA progress data (${response.status}).`);
const progress = await response.json();

if (!Number.isFinite(progress.solved) || !Array.isArray(progress.activity) || !Array.isArray(progress.recent)) {
  throw new Error('The source progress.json does not match the tracker schema.');
}

progress.updatedAt = new Date().toISOString();
await writeFile('data/dsa-progress.json', JSON.stringify(progress, null, 2) + '\n');
console.log(`Synced ${progress.solved} solved problems from ${sourceUrl}.`);
