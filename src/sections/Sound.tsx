import { Frame } from '@/components/Frame'
import { SectionHead } from '@/components/SectionHead'
import { artist, soundTerritory, statements } from '@/data/site'
import { sound as soundStory } from '@/data/story'
import { useReveal } from '@/lib/hooks'
import './Sound.css'

/** Ticks on the tempo axis. Real BPM values, evenly spaced. */
const AXIS = [120, 130, 140, 150, 160]
const AXIS_MIN = AXIS[0]
const AXIS_MAX = AXIS[AXIS.length - 1]
const pos = (bpm: number) => ((bpm - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100

export function Sound() {
  const listRef = useReveal<HTMLUListElement>()
  const tempoRef = useReveal<HTMLDivElement>({ threshold: 0.35 })

  return (
    <section id="sound" className="sound" data-light="sound" aria-labelledby="sound-title">
      <div className="shell sound__inner">
        <SectionHead
          index="03 / Sound"
          title="Music does not need instructions"
          id="sound-title"
          lead={
            <>
              <p>{statements.whyTechno}</p>
              <p>{statements.lowEnd}</p>
              <p>{soundStory.restorative}</p>
            </>
          }
        />

        {/*
          The five terms are set as a staircase rather than a bordered list.
          Each one steps further in and sits a little brighter than the last,
          so the block reads as one descending phrase instead of five rows in
          a table.
        */}
        <div className="sound__row">
          <ul className="sound__territory" ref={listRef}>
            {soundTerritory.map((term, i) => (
              <li key={term} style={{ '--i': i } as React.CSSProperties}>
                {term}
              </li>
            ))}
          </ul>

          <figure className="sound__photo">
            <Frame
              id="live-close-performance"
              alt="DKTech at the decks, close, in club light."
              sizes="(min-width: 1000px) 32vw, 90vw"
              treatment="documentary"
              ratio="4 / 5"
            />
          </figure>
        </div>

        <div className="sound__tempo" ref={tempoRef}>
          <div className="sound__axis" role="img" aria-label={`Working tempo, roughly ${artist.tempoLow} to ${artist.tempoHigh} beats per minute.`}>
            <div className="sound__axis-line" />
            <div
              className="sound__axis-band"
              style={{
                left: `${pos(artist.tempoLow)}%`,
                width: `${pos(artist.tempoHigh) - pos(artist.tempoLow)}%`,
              }}
            />
            {AXIS.map((bpm) => (
              <div key={bpm} className="sound__axis-tick" style={{ left: `${pos(bpm)}%` }}>
                <span className="data">{bpm}</span>
              </div>
            ))}
          </div>
          <p className="sound__tempo-note">
            Working tempo, roughly {artist.tempoLow} to {artist.tempoHigh} BPM.
          </p>
        </div>
      </div>
    </section>
  )
}
