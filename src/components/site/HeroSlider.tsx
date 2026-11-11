'use client'

import Image from 'next/image'
import { type ReactNode, useState } from 'react'

import { BOOK_HREF } from '@/components/site/navItems'
import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { type HeroSlideView, wrapIndex } from '@/lib/heroSlides'

import styles from './HeroSlider.module.css'

type HeroSliderProps = {
  /** 1–6 slides, resolved on the server by heroSlides() (plain, serializable data). */
  slides: HeroSlideView[]
  /** site-settings.headline: the page's only h1, visually hidden. */
  headline: string
  bookingLabel: string
  /** <SiteHeader tone="dark" current="home" />; inside a div, so it stays the banner landmark. */
  header: ReactNode
}

/**
 * Home hero (docs/design/components/HeroSlider.md): the one client component on Home. No autoplay;
 * story cards and wrapping arrows change the slide, focus stays on the control used, and the slide
 * text sits in a polite live region. Slide 1 is complete in the server HTML; the controls do
 * nothing until the page hydrates.
 */
export function HeroSlider({ slides, headline, bookingLabel, header }: HeroSliderProps) {
  const [index, setIndex] = useState(0)
  const count = slides.length
  const current = wrapIndex(index, count)
  const slide = slides[current]
  if (!slide) return null

  const many = count > 1
  const progress = `${((current + 1) / count) * 100}%`
  const show = (next: number) => setIndex(wrapIndex(next, count))
  const label = bookingLabel.trim()
  const tintClass = slide.tint === 'chapter' ? undefined : styles[slide.tint]

  return (
    <div className={[styles.hero, tintClass].filter(Boolean).join(' ')}>
      {slide.image?.url ? (
        <Image
          alt={slide.image.alt ?? ''}
          className={styles.image}
          fill
          // Only the current slide's photo is in the page; slide 1 is the page's largest image.
          key={slide.id}
          priority={current === 0}
          sizes="100vw"
          src={slide.image.url}
          style={{ objectPosition: `${slide.image.focalX ?? 50}% ${slide.image.focalY ?? 50}%` }}
        />
      ) : null}
      <div aria-hidden="true" className={styles.scrim} />

      <div className={styles.top}>
        {many ? (
          <div aria-hidden="true" className={styles.bar}>
            <div className={styles.fill} style={{ width: progress }} />
          </div>
        ) : null}
        {header}
      </div>

      <h1 className="visually-hidden">{headline}</h1>

      <div className={styles.content}>
        <div className={styles.inner}>
          <div aria-live="polite" className={styles.text}>
            {many ? <p className="visually-hidden">{copy.home.storyPosition(current + 1, count)}</p> : null}
            <span aria-hidden="true" className={styles.rule} />
            {slide.placeLine ? <p className={styles.placeLine}>{slide.placeLine}</p> : null}
            <h2 className={styles.title}>{slide.title}</h2>
            {slide.body ? <p className={styles.body}>{slide.body}</p> : null}
            {label || slide.link ? (
              <div className={styles.actions}>
                {label ? (
                  <Button href={BOOK_HREF} size="primary" variant="gold">
                    {label}
                  </Button>
                ) : null}
                {slide.link ? (
                  <Button href={slide.link.href} size="primary" variant="outline-light">
                    {slide.link.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {many ? (
            <div className={styles.controls}>
              <div aria-label={copy.home.moreStories} className={styles.cards} role="group">
                {slides.map((item, position) => (
                  <StoryCard current={position === current} key={item.id} onSelect={() => show(position)} slide={item} />
                ))}
              </div>
              <div className={styles.nav}>
                <button
                  aria-label={copy.home.previousStory}
                  className={styles.arrow}
                  onClick={() => show(current - 1)}
                  type="button"
                >
                  <span aria-hidden="true">{copy.finale.backArrow}</span>
                </button>
                <button
                  aria-label={copy.home.nextStory}
                  className={styles.arrow}
                  onClick={() => show(current + 1)}
                  type="button"
                >
                  <span aria-hidden="true">{copy.arrow}</span>
                </button>
                <div aria-hidden="true" className={styles.track}>
                  <div className={styles.fill} style={{ width: progress }} />
                </div>
                <span aria-hidden="true" className={styles.counter}>
                  {String(current + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * One slide's card: a real button named by its visible kicker and title (WCAG 2.5.3). Every slide
 * has one, in a fixed place; the current one is marked, never removed (P4 owner decision 1).
 */
function StoryCard({ slide, current, onSelect }: { slide: HeroSlideView; current: boolean; onSelect: () => void }) {
  return (
    <button
      aria-current={current ? 'true' : undefined}
      className={styles.card}
      onClick={onSelect}
      // Browsers leave a partly visible card clipped by the scrolling row when it gets focus.
      onFocus={(event) => event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}
      type="button"
    >
      <span aria-hidden="true" className={styles.cardRule} />
      {slide.cardKicker ? <span className={styles.kicker}>{slide.cardKicker}</span> : null}{' '}
      <span className={styles.cardTitle}>{slide.title}</span>
    </button>
  )
}
