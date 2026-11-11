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
  /** Short month names for dates ("6 Nov 2026"). Fixed, because en-GB writes September as "Sept". */
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
  /** Joins breadcrumb links and meta parts ("Portfolio · Collection 01"); hidden from screen readers. */
  separator: '·',
  chapter: {
    /** "Chapter 01": the number is counted at render time, never stored. */
    label: (n: number) => `Chapter ${String(n).padStart(2, '0')}`,
  },
  finale: {
    label: 'Book me',
    /** Body under site-settings.finaleHeadline where no discipline finale applies (Portfolio). */
    defaultBody: "Seen something close to what you have in mind? Tell me about it and we'll start from there.",
    backToPortfolio: 'Back to portfolio',
    /** Leading arrow on "Back to portfolio"; hidden from screen readers. */
    backArrow: '←',
  },
  portfolio: {
    contextLine: 'Four collections · photography, film, design and words',
    title: 'Portfolio',
    lead: 'Each collection gathers my strongest work, with individual projects inside — so you can see how each one came together, start to finish.',
    tileLabel: (n: number) => `Collection ${String(n).padStart(2, '0')}`,
    viewCollection: 'View collection',
  },
  collection: {
    contextLine: (n: number) => `Collection ${String(n).padStart(2, '0')}`,
    seeProjects: 'See the projects',
    highlights: 'Highlights',
    highlightsAside: 'A best-of selection across every project in this collection.',
    projects: 'Projects',
    selectedPieces: 'Selected pieces',
    /** Shown instead of a grid when a collection has no published projects. */
    empty: 'New work is on its way',
    moreProjects: 'More projects',
    viewProject: 'View project',
    read: 'Read',
  },
  journal: {
    contextLine: 'Journal',
    title: 'Stories behind the pictures',
    lead: 'Notes from shoots, edits and drafts — the stories behind the work, and things I notice along the way.',
    /** Shown instead of rows while nothing is published (the Build Spec's empty-state line). */
    empty: 'New work is on its way',
    readStory: 'Read story',
    olderStories: 'Older stories',
    /** aria-label of the pagination navigation. */
    navLabel: 'Journal pages',
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    perPage: (count: number) => `${count} stories per page`,
    /** Accessible name of a page-number link. */
    pageLabel: (page: number) => `Page ${page}`,
    /** Document title of /journal/page/N. */
    pageTitle: (page: number) => `Journal · Page ${page}`,
    /** Finale body on journal pages (captures 09 and 10). */
    finaleBody: "Tell me about what you're making, and we'll start from there.",
    backToJournal: 'Back to journal',
    seeTheWork: 'See the work',
  },
  video: {
    /** Play button label; the caption is appended when there is one. */
    play: 'Play video',
    /** iframe title when the video has no caption. */
    title: 'Video',
  },
  details: {
    collection: 'Collection',
    type: 'Type',
    year: 'Year',
    client: 'Client',
    role: 'My role',
    /** Accessible name of the project credits section. */
    credits: 'Credits',
  },
  book: {
    /** The owner's inquiry alert email: plain text (P3 owner decision 10). */
    alert: {
      /** Sender name for every email the site sends (the alert and Payload's password reset). */
      fromName: 'Portfolio website',
      subject: (projectType: string, name: string) => `New inquiry · ${projectType} · ${name}`,
      intro: (name: string) => `New inquiry from ${name}`,
      name: 'Name',
      email: 'Email',
      projectType: 'Project type',
      timing: 'Timing',
      message: 'Message',
      /** Shown when the visitor left timing empty. */
      noTiming: '—',
      open: 'Open in the Studio',
    },
  },
} as const
