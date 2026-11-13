import type { ReactNode } from 'react'
import { useReveal } from '@/lib/hooks'
import './SectionHead.css'

type Props = {
  index: string
  title: string
  id?: string
  lead?: ReactNode
  /**
   * lead   big title, supporting text set below and indented
   * plain  title only
   * quiet  small title, used where the data below is the real headline
   */
  variant?: 'lead' | 'plain' | 'quiet'
}

/**
 * A heading and a marker, not a container.
 *
 * There is no rule across the top and no two column split. Both were making
 * every section open the same way, which is what made the page read as a
 * document rather than a space. What is left is a small index mark with a
 * crimson tick that lights as the section arrives, and the title.
 */
export function SectionHead({ index, title, id, lead, variant = 'lead' }: Props) {
  const ref = useReveal<HTMLDivElement>()

  return (
    <div className={`sechead sechead--${variant}`} ref={ref}>
      <p className="sechead__index label" aria-hidden="true">
        <span className="sechead__tick" />
        {index}
      </p>
      <h2 className="sechead__title" id={id}>
        {title}
      </h2>
      {lead ? <div className="sechead__lead">{lead}</div> : null}
    </div>
  )
}
