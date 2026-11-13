#!/usr/bin/env bash
#
# prepare-video.sh
#
# Cuts the two hero loops out of the original live videos and writes them to
# public/media. The originals are only read. They belong to the private source
# archive (09_VIDEO), so this runs only where that archive is present:
#
#   ARCHIVE="/path/to/09_VIDEO" bash scripts/prepare-video.sh
#
# Needs ffmpeg with libx264. Each loop is twelve seconds, silent, lightly
# denoised (phone footage in club light compresses badly otherwise) and fades
# from black and back to black, so the cut where it restarts reads as a breath
# in a dark room rather than a jump.
#
#   hero-loop-wide  DEPO Clubhouse, the booth from the floor (desktop)
#   hero-loop-tall  hands on the mixer, close (phones)

set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
archive="${ARCHIVE:-$root/09_VIDEO}"
out="$root/public/media"
mkdir -p "$out"

command -v ffmpeg >/dev/null || { echo "ffmpeg is not installed"; exit 1; }

loop() {
  local id="$1" file="$2" start="$3" len="$4" w="$5" h="$6"
  local fade_out
  fade_out=$(awk -v l="$len" 'BEGIN { printf "%.2f", l - 0.8 }')
  ffmpeg -v error -y -ss "$start" -t "$len" -i "$archive/$file" -an \
    -vf "scale=$w:$h:force_original_aspect_ratio=increase,crop=$w:$h,hqdn3d=3:3:6:6,fps=25,fade=t=in:st=0:d=0.8,fade=t=out:st=$fade_out:d=0.8,format=yuv420p" \
    -c:v libx264 -preset slow -crf 28 -profile:v high -movflags +faststart \
    "$out/$id.mp4"
  echo "$id.mp4 $(( $(wc -c < "$out/$id.mp4") / 1024 )) kB"
}

loop hero-loop-wide DKTECH_VIDEO_1000143682.mp4 30 12 1280 720
loop hero-loop-tall DKTECH_VIDEO_1000080643.mp4 6 12 720 1280
