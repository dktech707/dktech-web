import { Chapter } from '@/components/Chapter'
import { Artefact } from '@/components/Artefact'
import { artefactById } from '@/data/covers'
import { crkva, heavyweight, people } from '@/data/story'
import './People.css'

/**
 * The people chapter.
 *
 * MarAxe appears as a friend, a mentor and a studio collaborator. The sleeves
 * beside him are the evidence for the collaboration and nothing more: no
 * shared performance is described anywhere on this site, because no supplied
 * source documents one. A booking deck lists a back to back set as something a
 * promoter can book, which is not the same thing as a show that happened.
 */
export function People() {
  const maraxe = people[0]
  const ogi = people[1]

  return (
    <section id="people" className="people" data-light="people" aria-labelledby="people-title">
      <div className="shell people__inner">
        <Chapter index="08" title="People who opened doors" />
        <h2 className="u-visually-hidden" id="people-title">
          People
        </h2>

        <article className="people__person">
          <header>
            <h3 className="people__name">{maraxe.name}</h3>
            <p className="people__role data">{maraxe.role}</p>
          </header>
          <div className="people__body">
            {maraxe.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </article>

        {/* Studio credits, laid out as a shelf rather than a grid. */}
        <div className="people__shelf">
          <p className="label people__shelf-head">Written together</p>
          <div className="people__shelf-row">
            {maraxe.releases.map((id, i) => {
              const art = artefactById[id]
              if (!art) return null
              return (
                <Artefact
                  key={id}
                  data={art}
                  sizes="(min-width: 1000px) 17vw, 40vw"
                  z={[0, -60, -110, -40, 30][i] ?? 0}
                  tilt={[-1.5, 1, -0.8, 1.4, -1][i] ?? 0}
                  className={`people__sleeve people__sleeve--${i + 1}`}
                  captioned
                />
              )
            })}
          </div>
        </div>

        <div className="people__pair">
          <article className="people__note">
            <h3 className="people__note-title">{heavyweight.title}</h3>
            {heavyweight.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </article>

          <article className="people__note">
            <h3 className="people__note-title">{crkva.title}</h3>
            {crkva.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </article>
        </div>

        <article className="people__person people__person--second">
          <header>
            <h3 className="people__name">{ogi.name}</h3>
            <p className="people__role data">{ogi.role}</p>
          </header>
          <div className="people__body">
            {ogi.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
