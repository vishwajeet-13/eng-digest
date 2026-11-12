import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

if Path("/opt/homebrew/share/espeak-ng-data").exists():
    os.environ.setdefault("ESPEAK_DATA_PATH", "/opt/homebrew/share/espeak-ng-data")
from kokoro import KPipeline

FPS, SR, GAP, PAD, VOICE, SPEED = 30, 24000, 0.35, 0.5, "af_heart", 1.1
OUTRO = {"scene": "outro", "text": "That's your engineering digest. Read the full story at the link."}
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"

story, wav_out, props_out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
wav_out.parent.mkdir(parents=True, exist_ok=True)
props_out.parent.mkdir(parents=True, exist_ok=True)
pipe = KPipeline(lang_code="a")


def speak(text):
    raw = np.concatenate([a for _, _, a in pipe(text, voice=VOICE, speed=SPEED)]).astype(np.float32)
    trimmed = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", TRIM, "-f", "f32le", "-"], input=raw.tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(trimmed, dtype=np.float32)


t, scenes, track = PAD, [], [np.zeros(int(PAD * SR), dtype=np.float32)]
for line in json.loads(story.read_text())["lines"] + [OUTRO]:
    audio = speak(line["text"])
    dur = len(audio) / SR + GAP
    scenes.append({**line, "from": round(t * FPS), "duration": round(dur * FPS)})
    track += [audio, np.zeros(int(GAP * SR), dtype=np.float32)]
    t += dur
track.append(np.zeros(int(1.5 * SR), dtype=np.float32))
total = round((t + 1.5) * FPS)
scenes[-1]["duration"] = total - scenes[-1]["from"]
sf.write(wav_out, np.concatenate(track), SR)
props_out.write_text(json.dumps({"total": total, "scenes": scenes, "audio": str(wav_out.relative_to("public"))}))
print(f"{story} -> {t + 1.5:.1f}s")
