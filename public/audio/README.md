# Audio drop-in

No audio was supplied with this project, so every track in the catalogue
currently shows a "no audio file" marker. That is the correct state, not a bug.
Nothing on the site simulates playback and no waveform is drawn from anything
other than a decoded file.

To make the players live:

1. Put the audio files in this folder, for example `check-this-out.mp3`.
2. Create `manifest.json` here, keyed by ISRC:

```json
{
  "GBKQU2672241": "check-this-out.mp3",
  "PT9BS2600119": "gravitational.mp3"
}
```

ISRCs are the identifiers already carried by every catalogue row, so a file is
matched to the right recording rather than to a similar title. A row with more
than one ISRC will match on the first one that has a file.

The site picks the manifest up on load. Any track with a file gets a working
play control, a persistent player and a waveform computed from the decoded
audio itself. Everything else keeps the marker.

Nothing autoplays, ever.
