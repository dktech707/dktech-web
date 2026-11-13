import { useState } from 'react'
import { generatedImages, type GeneratedImageId } from '@/data/media.generated'
import './Frame.css'

type Treatment = 'plain' | 'documentary' | 'archive'

type Props = {
  id: GeneratedImageId
  alt: string
  sizes: string
  /**
   * documentary keeps the grain and the room colour of live photography.
   * archive pulls proof material back to a near-monochrome so it reads as
   * evidence rather than as a second brand on the page.
   */
  treatment?: Treatment
  priority?: boolean
  className?: string
  /** Aspect ratio override, for deliberate crops. */
  ratio?: string
  position?: string
}

/**
 * An image, not a card. No border, no rounded corner, no padding, no shadow.
 * The frame only holds the picture's own darkness while it loads so the layout
 * never shifts and a dark photograph never arrives on a white flash.
 */
export function Frame({ id, alt, sizes, treatment = 'plain', priority = false, className, ratio, position }: Props) {
  const img = generatedImages[id]
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={['frame', `frame--${treatment}`, className].filter(Boolean).join(' ')}
      data-loaded={loaded ? 'true' : 'false'}
      style={{
        aspectRatio: ratio ?? `${img.width} / ${img.height}`,
        backgroundImage: `url("${img.lqip}")`,
      }}
    >
      <img
        src={img.fallback}
        srcSet={img.srcSet}
        sizes={sizes}
        width={img.width}
        height={img.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  )
}
