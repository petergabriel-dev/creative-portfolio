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
  /** Home (capture 01, P4). */
  home: {
    selectedWork: 'Selected work',
    behindTheCamera: 'Behind the camera',
    getToKnowMe: 'Get to know me',
    explore: 'Explore the portfolio',
    allCollections: 'All collections',
    /** Call to action on Home's collection tiles. */
    viewGallery: 'View gallery',
    journal: 'From the journal',
    readTheJournal: 'Read the journal',
    finaleBody:
      "Tell me about what you're making — a day to photograph, a film, a brand or a story — and we'll start from there.",
    /** Hero slider controls (screen-reader names of the arrow buttons and the card group). */
    previousStory: 'Previous story',
    nextStory: 'Next story',
    moreStories: 'More stories',
    /** Visually hidden, first in the hero's live region, so a change is announced with its place. */
    storyPosition: (n: number, total: number) => `Story ${n} of ${total}`,
  },
  /** About (capture 08, P4). */
  about: {
    /** Used only while the about global is unpublished (P4 owner decision 6). */
    contextLine: 'About · the person behind the work',
    title: 'About',
    viewMyWork: 'View my work',
    /** Finale body, as on the journal pages (capture 08). */
    finaleBody: "Tell me about what you're making, and we'll start from there.",
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
    /** Page title when site-settings has no booking label. */
    metaTitle: 'Book Me',
    metaDescription:
      'Share a little about what you have in mind — the kind of project, any dates, and what matters most to you.',
    /** Fixed copy, worded as capture 11 (P3 owner decision 12; final wording in P7). */
    contextLine: 'Book me · photography, film, design & writing',
    title: "Let's talk about your project",
    lead: (replyTime: string) =>
      `Share a little about what you have in mind — the kind of project, any dates, and what matters most to you. I read every message myself${replyTime ? ` and reply within ${replyTime}` : ''}.`,
    goodToKnow: {
      title: 'Good to know',
      email: 'Prefer email?',
      location: 'Based in',
      workingOn: 'Working on',
      /** Fixed copy (P3 owner decision 12). */
      workingOnValue: 'Photography, film, design & writing',
      note: "This starts a conversation — nothing is booked until we've talked it through.",
    },
    sent: {
      label: 'Inquiry sent',
      title: "Thank you — I'll be in touch soon",
      body: (replyTime: string) =>
        `I'll read your note and reply ${replyTime ? `within ${replyTime}` : 'soon'} so we can talk through your plans.`,
      portfolio: 'Browse the portfolio',
      home: 'Back to home',
      another: 'Send another inquiry',
    },
    form: {
      /** Accessible name of the <form>. */
      label: 'Booking inquiry',
      name: 'Your name',
      email: 'Email',
      projectType: 'What kind of project?',
      choose: 'Choose one',
      timing: 'Timing (if you know it)',
      timingPlaceholder: 'A date, a month, or not sure yet',
      message: 'Tell me about it',
      messagePlaceholder: "What it's for, who it's for, and what you'd love it to feel like.",
      /** Honeypot label; hidden from people and screen readers. */
      website: 'Website',
      submit: 'Send inquiry',
      sending: 'Sending…',
      /** Failed save (P3 owner decision 13): the email part is left out without a contact email. */
      failed: "Sorry — your message didn't send. Please try again",
      failedEmail: ', or email me at ',
      /** Last project-type option, after the discipline names. */
      somethingElse: 'Something else',
      /** Build Spec "Book Me & inquiries flow", word for word. Timing and the honeypot have none. */
      errors: {
        name: 'Please add your name.',
        email: 'Please check your email address.',
        projectType: 'Please choose the kind of project.',
        message: 'Tell me a little more — at least a sentence or two.',
      },
    },
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
  /** The Studio (P5): docs/design/components/StudioOverview.md. */
  studio: {
    /** StudioBrand's second line, and the name the icon gives a link that wraps it. */
    brandLabel: 'Studio · CMS',
    iconLabel: 'Studio',
    /** The sidebar (docs/design/components/StudioNav.md). */
    nav: {
      ariaLabel: 'Studio',
      overview: 'Overview',
      portfolio: 'Portfolio',
      projects: 'Projects',
      collections: 'Collections',
      journal: 'Journal',
      posts: 'Posts',
      categories: 'Categories',
      inbox: 'Inbox',
      inquiries: 'Inquiries',
      library: 'Library',
      media: 'Media',
      settings: 'Settings',
      siteSettings: 'Site settings',
      homePage: 'Home page',
      aboutPage: 'About page',
      admin: 'Admin',
      users: 'Users',
      /** The inquiries badge; hidden at 0 (owner decision 8). */
      newCount: (count: number) => `${count} new`,
      viewSite: 'View the site',
      viewSiteArrow: '↗',
      newTab: '(opens in a new tab)',
      signedInAs: (name: string) => `Signed in as ${name}`,
      logOut: 'Log out',
    },
    /** The log-in at /admin/login (docs/design/components/StudioLogin.md, captures 20 and 20--error). */
    login: {
      label: 'Studio',
      title: 'Log in',
      email: 'Email',
      password: 'Password',
      submit: 'Log in',
      pending: 'Logging in…',
      forgot: 'Forgot password?',
      backToSite: 'Back to the site',
      lockNote: 'After 5 wrong tries the account locks for 15 minutes.',
      /** Owner decision 6 (2026-11-11). "invalid" never says whether the email exists. */
      errors: {
        empty: 'Enter your email and password to log in.',
        invalid: "That email and password don't match.",
        locked: 'This account is locked after too many wrong tries. Try again in 15 minutes.',
        failed: 'Something went wrong. Try again.',
      },
    },
    /** Payload's password-reset email, with an absolute link (P5 QA fix). */
    resetEmail: {
      intro: 'Someone asked to reset the password for your Studio account. If it was you, open this link to choose a new one:',
      ignore: "If you didn't ask for this, ignore this email; your password stays the same.",
    },
    /** The Overview at /admin (docs/design/components/StudioOverview.md, capture 21). */
    overview: {
      label: 'Studio',
      title: 'Overview',
      greeting: "Good to see you. Here's what needs you today.",
      viewSite: 'View site',
      newProject: 'New project',
      needsReply: 'Needs a reply',
      newCount: (count: number) => `${count} new`,
      nothingWaiting: 'Nothing waiting.',
      openInquiries: 'Open inquiries',
      drafts: 'Drafts',
      unpublishedCount: (count: number) => `${count} unpublished`,
      noDrafts: 'No drafts.',
      allProjects: 'All projects',
      allPosts: 'All posts',
      onTheHomePage: 'On the home page',
      heroSlides: 'Hero slides, in order',
      noSlides: 'No hero slides published yet.',
      editHomePage: 'Edit Home page',
      recentlyEdited: 'Recently edited',
      nothingEdited: 'Nothing edited yet.',
      edit: 'Edit',
      /** Status chips. */
      published: 'Published',
      draft: 'Draft',
      changes: 'Unpublished changes',
    },
    /** Meta-line prefixes: "Project · Wedding", "Journal · Process". */
    project: 'Project',
    journal: 'Journal',
    /** A doc saved before it had a title. */
    untitled: 'Untitled',
    /** The Overview's Selected work line; Home shows at most nine (owner decision 1). */
    selectedWorkLine: (count: number) =>
      count <= 0
        ? 'Nothing is marked “On home” yet.'
        : count === 1
          ? "Selected work shows 1 piece you've marked “On home”."
          : count <= 9
            ? `Selected work shows ${count} pieces you've marked “On home”.`
            : `Selected work shows the first 9 of ${count} pieces you've marked “On home”.`,
  },
} as const
