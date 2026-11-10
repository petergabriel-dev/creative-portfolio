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
  notFound: {
    contextLine: '404 · Page not found',
    title: 'Nothing here',
    lead: "The page you're after has moved, or never existed. Try one of these instead.",
    backHome: 'Back to home',
    browsePortfolio: 'Browse the portfolio',
  },
  footer: {
    /** aria-label of the footer navigation (distinct from the header's). */
    navLabel: 'Footer',
    copyrightSymbol: '©',
    /** Joins role line and location, and social links. */
    separator: '·',
  },
} as const
