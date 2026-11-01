# Daily digest instructions

You write a daily engineering digest for a complete beginner. Today's date is the current date in Asia/Kolkata (`TZ=Asia/Kolkata date +%F`).

0. If `_posts/<YYYY-MM-DD>-digest.md` for today already exists, stop: today's digest is already done.
1. Fetch every feed in `feeds.md` with `curl -sL -m 20 -A 'Mozilla/5.0'`. Keep items published in the last 48 hours; if fewer than 5 good ones, widen to 4 days. Skip a feed that fails.
2. Drop any link already present in the last 7 files in `_posts/`.
3. Pick the 5–8 most important items: big launches, outages and postmortems, interesting architecture write-ups, major AI news, widely discussed ideas. Prefer depth over hype; skip ads, job posts, event promos and minor release notes. Cover a mix of topics.
4. Open each chosen article and read the whole text before summarizing; never truncate it.
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

<pre class="mermaid">
flowchart LR
  A[Step] --> B[Step]
</pre>

🎬 [Watch: <video title> (<channel>, <length>)](<youtube url>)

[Read the full post →](<url>)

---
```

Rules: simple words, short sentences, every technical term either avoided or explained in "New words". Never invent facts not in the article.

Diagram: add the `<pre class="mermaid">` block only when the item explains how a system or process works; 3–7 boxes, short plain labels. Otherwise leave it out. If the post has any diagram, end the file with `{% include mermaid.html %}`.

Video: for the 1–3 items whose core concept a beginner would struggle with (e.g. Kubernetes, vector databases, CDNs), use WebSearch to find one good existing YouTube explainer from a well-known channel (ByteByteGo, Fireship, IBM Technology, Hussein Nasser, etc.), ideally under 15 minutes. Only use a URL you found in search results. Otherwise leave the line out.

6. If nothing qualifies, still write the file with a single line saying it was a quiet day.
7. `git add _posts && git commit -m "digest: <YYYY-MM-DD>" && git push origin HEAD:main`. The digest is now live; the video steps below must never block it.
8. Explainer videos for the 2 stories that most benefit from a visual explanation (`<n>` = the story's number in the digest):
   - Read `video/SCENES.md` and write `video/stories/<YYYY-MM-DD>/<n>.json` for each.
   - `bash video/make.sh <YYYY-MM-DD>` (first run installs dependencies; if Kokoro fails on espeak, `apt-get install -y espeak-ng` and retry).
   - `python3 video/publish.py <YYYY-MM-DD> ../eng-digest-videos` (keeps only the last 7 days of videos and removes their players from older posts).
   - In the post, right after each of those stories' source/topic line, add a blank line and then:
     `<video controls playsinline preload="none" poster="https://vishwajeet-13.github.io/eng-digest-videos/<YYYY-MM-DD>/<n>.jpg" src="https://vishwajeet-13.github.io/eng-digest-videos/<YYYY-MM-DD>/<n>.mp4"></video>`
   - `git add _posts video/stories && git commit -m "videos: <YYYY-MM-DD>" && git push origin HEAD:main`.
   If any video step keeps failing, stop the video work and say why in your summary.
