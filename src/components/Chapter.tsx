import type { ReactNode } from 'react'
import { useReveal } from '@/lib/hooks'
import './Chapter.css'

type Props = {
  /** Two digits. The reader is moving through a sequence, not browsing a menu. */
  index: string
  /** A year, a place, or nothing. Set very large; it is the only display type. */
  marker?: string
  title?: string
  children?: ReactNode
  className?: string
}

/**
 * A chapter opening.
 *
 * Deliberately not the same shape as the section heads elsewhere on the page.
 * A chapter announces itself with a number and, where there is one, a year set
 * large enough to act as the image. Several chapters have no title at all,
 * because a date and two sentences say more than a headline would.
 */
export function Chapter({ index, marker, title, children, className }: Props) {
  const ref = useReveal<HTMLDivElement>({ threshold: 0.15 })

  return (
    <div className={['chapter', className].filter(Boolean).join(' ')} ref={ref}>
      <p className="chapter__index label" aria-hidden="true">
        <span className="chapter__tick" />
        {index}
      </p>
      {marker ? <p className="chapter__marker">{marker}</p> : null}
      {title ? <h2 className="chapter__title">{title}</h2> : null}
      {children ? <div className="chapter__body">{children}</div> : null}
    </div>
  )
}
