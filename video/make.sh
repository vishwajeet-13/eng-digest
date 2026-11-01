#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
D=$1
PY=${PY:-python3}
[ -d node_modules ] || npm ci --no-audit --no-fund
$PY -c "import kokoro" 2>/dev/null || $PY -m pip install -q kokoro soundfile "setuptools<81" "en_core_web_sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl"
mkdir -p "out/$D"
for s in stories/"$D"/*.json; do
  n=$(basename "$s" .json)
  $PY build.py "$s" "public/$D/$n.wav" "out/$D/$n.props.json"
  npx remotion render Explainer "out/$D/$n.mp4" --props="out/$D/$n.props.json" --crf=28 --log=error
  ffmpeg -v error -y -ss 2 -i "out/$D/$n.mp4" -frames:v 1 -q:v 4 "out/$D/$n.jpg"
done
ls -la "out/$D"
