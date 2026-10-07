'use client'

import { useState } from 'react'

import { artBg, Brick } from './Brick'

export function Gallery({
  images,
  title,
  color,
}: {
  images: { large: string; thumb: string }[]
  title: string
  color: string
}) {
  const [i, setI] = useState(0)
  if (!images.length) {
    return (
      <div className="main-photo" style={{ background: artBg(color) }}>
        <Brick color={color} />
      </div>
    )
  }
  return (
    <>
      <div className="main-photo">
        <img src={images[i].large} alt={title} />
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((img, n) => (
            <button key={img.thumb} aria-current={n === i} aria-label={`Фото ${n + 1}`} onClick={() => setI(n)}>
              <img src={img.thumb} alt="" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
