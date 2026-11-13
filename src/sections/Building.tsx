import { Chapter } from '@/components/Chapter'
import { Frame } from '@/components/Frame'
import { legacy } from '@/data/story'
import { infrastructure, documentation, mixmag, type EcoNode } from '@/data/ecosystem'
import { labels } from '@/data/catalogue'
import { useReveal } from '@/lib/hooks'
import './Building.css'

const countFor = (key?: string) => (key ? (labels.find((l) => l.key === key)?.count ?? null) : null)

function Node({ node, i }: { node: EcoNode; i: number }) {
  const n = countFor(node.labelKey)
  return (
    <li className="building__node" style={{ '--i': i } as React.CSSProperties}>
      <div className="building__mark">
        {node.imageId ? (
          <Frame id={node.imageId} alt={`${node.name} logo.`} sizes="90px" treatment="archive" ratio="1 / 1" />
        ) : (
          <span className="building__mark-blank" aria-hidden="true" />
        )}
      </div>
      <div className="building__body">
        <p className="label building__kind">
          {node.role}
          {node.status === 'building' ? <span className="building__soon"> / in progress</span> : null}
        </p>
        <h3 className="building__name">{node.name}</h3>
        <p className="building__text">{node.body}</p>
        {node.children ? (
          <ul className="building__children">
            {node.children.map((c) => (
              <li key={c.name}>
                <p className="building__child-name">{c.name}</p>
                <p className="building__child-text">{c.body}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="building__count data">{n === null ? '' : `${n} catalogue rows`}</p>
    </li>
  )
}

export function Building() {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section id="building" className="building" data-light="building" aria-labelledby="building-title">
      <div className="shell building__inner" ref={ref}>
        <Chapter index="11" title="What is being built" />
        <h2 className="u-visually-hidden" id="building-title">
          Labels, documentation and archive
        </h2>

        <p className="label building__movement">Around the music</p>
        <ul className="building__list">
          {infrastructure.map((node, i) => (
            <Node key={node.id} node={node} i={i} />
          ))}
        </ul>

        <p className="label building__movement">Writing it down</p>
        <ul className="building__list">
          {documentation.map((node, i) => (
            <Node key={node.id} node={node} i={i + infrastructure.length} />
          ))}
        </ul>

        {/*
          Mixmag Adria is a curatorial and editorial role, not a press badge.
          The screenshot is shown as one page of evidence inside the moment,
          never as the whole of it.
        */}
        <div className="building__editorial">
          <div className="building__editorial-text">
            <p className="label building__kind">
              {mixmag.outlet} / {mixmag.role}
            </p>
            <h3 className="building__name">{mixmag.column}</h3>
            <p className="building__text">{mixmag.body}</p>
          </div>
          <figure className="building__editorial-proof">
            <Frame
              id={mixmag.imageId}
              alt="A page from the Hardgroove - Hard Techno Radar column DKTech writes for Mixmag Adria."
              sizes="(min-width: 1000px) 30vw, 78vw"
              treatment="archive"
              ratio="1 / 1"
            />
            <figcaption className="data">One page of the column.</figcaption>
          </figure>
        </div>

        <div className="building__legacy">
          <p className="building__legacy-line">{legacy.doors}</p>
          <p className="building__legacy-line">{legacy.name}</p>
          <p className="building__legacy-line building__legacy-line--quiet">{legacy.house}</p>
        </div>
      </div>
    </section>
  )
}
