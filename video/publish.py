import datetime
import re
import shutil
import subprocess
import sys
from pathlib import Path

KEEP_DAYS = 7
day, repo = sys.argv[1], Path(sys.argv[2])
video_dir = Path(__file__).resolve().parent
posts = video_dir.parent / "_posts"
cutoff = (datetime.date.fromisoformat(day) - datetime.timedelta(days=KEEP_DAYS - 1)).isoformat()

target = repo / day
target.mkdir(parents=True, exist_ok=True)
for ext in ("mp4", "jpg"):
    for f in (video_dir / "out" / day).glob(f"*.{ext}"):
        shutil.copy2(f, target / f.name)
for d in repo.iterdir():
    if d.is_dir() and re.fullmatch(r"\d{4}-\d{2}-\d{2}", d.name) and d.name < cutoff:
        shutil.rmtree(d)
for post in posts.glob("*.md"):
    if post.name[:10] < cutoff and "eng-digest-videos" in (text := post.read_text()):
        post.write_text("".join(line for line in text.splitlines(keepends=True) if "eng-digest-videos" not in line))


def git(*args):
    subprocess.run(["git", "-C", str(repo), *args], check=True)


git("checkout", "-q", "--orphan", "fresh")
git("add", "-A")
git("commit", "-qm", f"videos: {day}")
git("branch", "-D", "main")
git("branch", "-m", "main")
git("push", "-qf", "origin", "main")
print(sorted(p.name for p in repo.iterdir() if p.is_dir() and not p.name.startswith(".")))
