import { Chapter } from '@/components/Chapter'
import { learning } from '@/data/story'
import './Learning.css'

/**
 * A short chapter about a gig that went badly.
 *
 * It is here because leaving it out would make the rest of the story a
 * highlight reel. No blame is assigned to anyone and nothing is turned into a
 * lesson for the reader.
 */
export function Learning() {
  return (
    <section id="learning" className="learning" data-light="learning" aria-label="First gig">
      <div className="shell learning__inner">
        <Chapter index="07" title={learning.place}>
          <p className="learning__what data">{learning.what}</p>
          {learning.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Chapter>
      </div>
    </section>
  )
}
