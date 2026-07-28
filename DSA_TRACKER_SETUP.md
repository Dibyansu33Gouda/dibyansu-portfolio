# DSA tracker setup

The portfolio reads `data/dsa-progress.json`. A scheduled GitHub Action updates
that file from your public solutions repository, so visitors never need access
to any platform API or secret.

## 1. Create the solutions repository

Create a public repository, for example `dsa-solutions`. Save each solution in a
clear folder structure, such as:

```text
arrays/two-sum.cpp
binary-search/lower-bound.cpp
graphs/bfs-traversal.cpp
progress.json
```

Keep the actual code there; the portfolio only displays the summary and links
back to the repository.

## 2. Add `progress.json` to that repository

Use this shape, updating it when you solve a problem. A later workflow in the
solutions repository can generate this file automatically from solution
metadata if desired.

```json
{
  "roadmap": "Striver's A2Z DSA Sheet",
  "profiles": {
    "leetcode": "https://leetcode.com/u/dibyansu_44/",
    "takeUForward": "https://takeuforward.org/profile/dibyansu_44",
    "solutions": "https://github.com/Dibyansu33Gouda/dsa-solutions"
  },
  "solved": 3,
  "currentStreak": 2,
  "longestStreak": 2,
  "topics": ["Arrays", "Hashing"],
  "activity": [
    {
      "date": "2026-07-28",
      "count": 2,
      "problems": [
        { "name": "Two Sum", "url": "https://github.com/Dibyansu33Gouda/dsa-solutions/blob/main/arrays/two-sum.cpp" },
        { "name": "Largest Element", "url": "https://github.com/Dibyansu33Gouda/dsa-solutions/blob/main/arrays/largest-element.cpp" }
      ]
    }
  ],
  "recent": [
    { "date": "2026-07-28", "name": "Two Sum", "topic": "Arrays", "difficulty": "Easy", "url": "https://github.com/Dibyansu33Gouda/dsa-solutions/blob/main/arrays/two-sum.cpp" }
  ]
}
```

Use the real dates, totals, and links—do not copy the example counts.

## 3. Connect it to this portfolio

In this portfolio GitHub repository, open **Settings → Secrets and variables →
Actions → Variables** and add:

```text
DSA_SOURCE_URL=https://raw.githubusercontent.com/YOUR-USERNAME/YOUR-SOLUTIONS-REPO/main/progress.json
```

Then run **Actions → Sync DSA progress → Run workflow** once. After that it
syncs daily and commits a change only when the tracker data changed.
