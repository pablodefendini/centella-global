#!/usr/bin/env bash
# Regenerate homepage hero poster (WebP) and H.264 variants from a source MP4.
# Requires: ffmpeg (PNG output), cwebp (brew install webp).
#
# Usage:
#   npm run media:hero -- path/to/source.mp4
#   HERO_SOURCE=path/to/source.mp4 npm run media:hero

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/public/media/hero"
SRC="${1:-${HERO_SOURCE:-}}"

if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "Usage: $0 path/to/source.mp4" >&2
  echo "Or:    HERO_SOURCE=path/to/source.mp4 $0" >&2
  exit 1
fi

FFMPEG="$(command -v ffmpeg || true)"
CWEBP="$(command -v cwebp || true)"
if [[ -z "$FFMPEG" ]]; then
  echo "optimize-hero-media: ffmpeg not found (install ffmpeg)." >&2
  exit 1
fi
if [[ -z "$CWEBP" ]]; then
  echo "optimize-hero-media: cwebp not found (brew install webp)." >&2
  exit 1
fi

mkdir -p "$OUT"
TMP="$(mktemp "${TMPDIR:-/tmp}/centella-poster.XXXXXX.png)"

cleanup() { rm -f "$TMP"; }
trap cleanup EXIT

echo "Poster (PNG frame → WebP)…"
"$FFMPEG" -y -ss 00:00:01.000 -i "$SRC" -vframes 1 \
  -vf "scale='min(1600,iw)':-1:flags=lanczos" \
  "$TMP"
"$CWEBP" -q 82 "$TMP" -o "${OUT}/centella-hero-bg-poster.webp"

echo "Video 720p…"
"$FFMPEG" -y -i "$SRC" -an \
  -c:v libx264 -preset medium -crf 26 -pix_fmt yuv420p \
  -vf "scale=-2:min(720\,ih):force_original_aspect_ratio=decrease" \
  -movflags +faststart \
  "${OUT}/centella-hero-bg-720.mp4"

echo "Video 540p…"
"$FFMPEG" -y -i "$SRC" -an \
  -c:v libx264 -preset medium -crf 28 -pix_fmt yuv420p \
  -vf "scale=-2:min(540\,ih):force_original_aspect_ratio=decrease" \
  -movflags +faststart \
  "${OUT}/centella-hero-bg-540.mp4"

echo "Done:"
ls -lh "${OUT}/centella-hero-bg-poster.webp" "${OUT}/centella-hero-bg-720.mp4" "${OUT}/centella-hero-bg-540.mp4"
