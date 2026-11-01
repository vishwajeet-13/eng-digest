# Writing a video script

One JSON file per story: `video/stories/<YYYY-MM-DD>/<story number>.json`, shaped `{"lines": [ ... ]}`.
Each line is one scene: `text` is the narration (one or two short sentences, max 25 words, plain words for a beginner) plus the scene's fields.
Use 6–9 lines (about 45–70 seconds). Start with a `title` hook, end with a takeaway (`bullets`). An outro is added automatically.
Only use facts from the article. Keep on-screen labels short (2–5 words). Emojis are the icons.

Tones: `accent` (default), `red`, `green`, `amber`, `ink`.

| scene | fields | use for |
|---|---|---|
| `title` | `kicker`, `big` (short: a number or 1–3 words), `emoji`, `note`, `tone` | hooks, one striking fact |
| `flow` | `title`, `steps: [{icon, label}]` (2–5) | how something works, step by step |
| `stats` | `title`, `items: [{value (number), prefix, suffix, label, tone}]` (1–3) | numbers and results |
| `cards` | `title`, `items: [{icon, label, sub, stamp, tone}]` (1–3; `stamp` like "FORGED" or "NEW") | defining terms, things involved |
| `grid` | `title`, `total` (≤10), `highlighted`, `icon`, `highlightIcon`, `tone` | "X out of 10", proportions |
| `compare` | `title`, `left: {icon, label, points}` (shown red/old), `right: {...}` (shown green/new) | before vs after, wrong vs right |
| `bullets` | `title`, `points: [{icon, text}]` (2–4) | takeaways, lists |

Example line: `{"scene": "stats", "text": "Cloudflare found about 160 forged certificates.", "title": "What Cloudflare saw", "items": [{"value": 160, "prefix": "~", "label": "forged certificates", "tone": "red"}]}`
