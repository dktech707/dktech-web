#!/usr/bin/env bash
#
# prepare-video.sh
#
# Cuts the hero clips out of the original live videos and writes them to
# public/media. The originals are only read. They belong to the private source
# archive (09_VIDEO), so this runs only where that archive is present:
#
#   ARCHIVE="/path/to/09_VIDEO" bash scripts/prepare-video.sh
#
# Needs ffmpeg with libx264. Every clip is vertical, ten seconds, silent, and
# kept at or below the resolution it was shot in: nothing is upscaled, which is
# what keeps phone footage sharp on a large screen. Each clip fades from black
# and back to black, so a loop restarting, or one clip handing over to the
# next on a phone, reads as a breath in a dark room rather than a jump.
#
#   loop-depo   DEPO Clubhouse, the booth from the floor (cropped upright)
#   loop-hands  hands on the mixer, close
#   loop-booth  the booth in pink light

set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
archive="${ARCHIVE:-$root/09_VIDEO}"
out="$root/public/media"
mkdir -p "$out"

command -v ffmpeg >/dev/null || { echo "ffmpeg is not installed"; exit 1; }

# clip <id> <file> <start s> <length s> <filter that ends at the final size>
clip() {
  local id="$1" file="$2" start="$3" len="$4" frame="$5"
  local fade_out
  fade_out=$(awk -v l="$len" 'BEGIN { printf "%.2f", l - 0.6 }')
  ffmpeg -v error -y -ss "$start" -t "$len" -i "$archive/$file" -an \
    -vf "$frame,hqdn3d=1.2:1.2:2:2,fps=30,fade=t=in:st=0:d=0.6,fade=t=out:st=$fade_out:d=0.6,format=yuv420p" \
    -c:v libx264 -preset slow -crf 23 -profile:v high -movflags +faststart \
    "$out/$id.mp4"
  echo "$id.mp4 $(( $(wc -c < "$out/$id.mp4") / 1024 )) kB"
}

# 1280x720 landscape, cropped to an upright 404x720 window on the booth.
clip loop-depo DKTECH_VIDEO_1000143682.mp4 30 10 "crop=404:720:470:0"
# 1080x1920 upright, brought down to 720x1280.
clip loop-hands DKTECH_VIDEO_1000080643.mp4 6 10 "scale=720:1280"
# 720x1280 upright, kept as shot.
clip loop-booth DKTECH_VIDEO_1000145321.mp4 50 10 "scale=720:1280"
