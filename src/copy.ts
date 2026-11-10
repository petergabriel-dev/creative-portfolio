/**
 * Every piece of site text that is not CMS content (Build Spec › Front-end
 * pages). Change wording here, in one place.
 */
export const copy = {
  site: {
    /** Used only while site-settings has no name yet. */
    fallbackName: 'Portfolio',
  },
  /** Trailing arrow on text-link buttons; hidden from screen readers. */
  arrow: '→',
  nav: {
    /** aria-label of the header navigation. */
    label: 'Main',
    home: 'Home',
    portfolio: 'Portfolio',
    about: 'About',
    journal: 'Journal',
  },
} as const
