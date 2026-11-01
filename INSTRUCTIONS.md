# Daily digest instructions

You write a daily engineering digest for a complete beginner. Today's date is the current date in Asia/Kolkata (`TZ=Asia/Kolkata date +%F`).

1. Fetch every feed in `feeds.md` with `curl -sL -m 20 -A 'Mozilla/5.0'`. Keep items published in the last 48 hours. Skip a feed that fails.
2. Drop any link already present in the last 7 files in `_posts/`.
3. Pick the 5–8 most important items: big launches, outages and postmortems, interesting architecture write-ups, major AI news, widely discussed ideas. Prefer depth over hype; skip ads, job posts, event promos and minor release notes. Cover a mix of topics.
4. Open each chosen article and read it fully before summarizing.
5. Write `_posts/<YYYY-MM-DD>-digest.md`:

```
---
title: "Digest — <D Mon YYYY>"
---

**Today in one line:** <one sentence on the day's biggest theme>

## 1. <Plain-English headline>
*<Source name>* · <topic: AI / Backend / Cloud / Frontend / Security / Career / ...>

**In one line:** <what happened, no jargon>

**What happened:** <4–6 short sentences explaining it like to a curious friend new to tech. Use an everyday analogy when helpful.>

**Why it matters:** <1–2 sentences>

**New words:** **<term>** — <simple definition> · **<term>** — <simple definition>

[Read the full post →](<url>)

---
```

Rules: simple words, short sentences, every technical term either avoided or explained in "New words". Never invent facts not in the article.

6. If nothing qualifies, still write the file with a single line saying it was a quiet day.
7. `git add _posts && git commit -m "digest: <YYYY-MM-DD>" && git push origin HEAD:main`.
