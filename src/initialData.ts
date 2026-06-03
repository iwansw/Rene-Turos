import { 
  BookProject, 
  ProspectStatus, 
  FeedbackStatus, 
  ProposalStatus, 
  ContractStatus, 
  TaskStatus, 
  ProductionChapterStatus, 
  ISBNStatus, 
  CoverStatus, 
  DummyBookStatus, 
  TrophyStatus 
} from './types';

export const INITIAL_PROJECTS: BookProject[] = [
  {
    id: 'proj-1',
    ownerId: '',
    projectName: 'The Whispering Pines',
    createdAt: '2026-05-01',
    currentPhaseIndex: 6, // Phase 7: Printing
    clientContact: {
      name: 'Arthur Green',
      phone: '+62 811-2345-6789',
      email: 'arthur@greenwoodpublish.com'
    },
    prospect: {
      meetingDate: '2026-05-02',
      meetingTime: '10:00',
      meetingLocation: 'Milestone Editorial Suites, Board Room A',
      noted: true,
      status: ProspectStatus.PROCEED
    },
    requirementBrief: {
      briefNotes: 'Intimate historical fiction novel set in 19th-century Oregon. Desires premium cream paper stock with custom forest illustrations. Target page count is ~320 pages. Budget around Rp 180.000.005 for a first run of 500 hardcover copies.',
      briefDate: '2026-05-03',
      targetAudience: 'Trade Books',
      bookGenre: 'Historical Fiction'
    },
    creativeBrief: {
      proposedBookTitle: 'The Whispering Pines: Secrets of the Oregon Ridge',
      creativeConcept: 'Classic typography using traditional serif headings. Dark green and copper foil texture tones for the cover illustration. Staggered chapter-start illustrations of lone pines.',
      proposedDesignStyle: 'Traditional Editorial, Warm & Organic',
      clientFeedbackNotes: 'The woodcut forest pattern proposal looks incredibly stunning. Green foil on the spine is highly requested!',
      feedbackStatus: FeedbackStatus.APPROVED,
      feedbackDate: '2026-05-05'
    },
    proposal: {
      offerings: [
        { id: 'srv-1', serviceName: 'Structural Editing & Co-writing Support', description: 'Comprehensive review of manuscript flow, pacing, and chapter milestones.', cost: 52500000, selected: true },
        { id: 'srv-2', serviceName: 'Typographic Layout & Formatting', description: 'Meticulous micro-typography, margins, headers, and drop caps formatted for print.', cost: 30000000, selected: true },
        { id: 'srv-3', serviceName: 'Custom Cover Illustration', description: 'Hand-crafted woodcut style front, spine, and back wrapper styling.', cost: 22500000, selected: true },
        { id: 'srv-4', serviceName: 'Hardcover Fine Printing (500 copies)', description: 'Hardcover bound, 90gsm acid-free cream paper, gold-embossed spine, custom cloth wraps.', cost: 82500000, selected: true },
        { id: 'srv-5', serviceName: 'Distribution & Digital Marketing Expansion', description: 'Metadata optimization, distribution on major bookstore platforms, and press release kits.', cost: 18000000, selected: false }
      ],
      additionalTerms: '50% initial downpayment prior to Pre-Production, 30% upon Dummy Book approval, and 20% on final printed copies delivery.',
      dateSent: '2026-05-06',
      status: ProposalStatus.APPROVED
    },
    closing: {
      finalAmount: 187500000,
      contractStatus: ContractStatus.SIGNED,
      contractDraftText: 'This Publishing Services Contract is made on May 8, 2026, between Milestone Group (Publisher) and Arthur Green (Author/Client) for the production of "The Whispering Pines". The Publisher agrees to furnish full professional editing, interior formatting, custom spine tooling, and premium hardcover printing. Total due: IDR 187.500.000. Signed and validated electronically.',
      signedDate: '2026-05-08',
      signingRepresentative: 'Arthur Green (Authorized Signee)'
    },
    preProduction: {
      outlineChapters: [
        'Chapter 1: The Trail is Cold',
        'Chapter 2: Wind through the Canopies',
        'Chapter 3: Footsteps in the Timber',
        'Chapter 4: The Cabin at Lost Creek',
        'Chapter 5: Whispering Secrets'
      ],
      teamAssignments: [
        { role: 'Editor-in-Chief', employeeName: 'Evelyn Mercer' },
        { role: 'Graphic & Cover Designer', employeeName: 'Carlos Ruiz' },
        { role: 'Lead Typesetter', employeeName: 'Siti Rahma' },
        { role: 'Production Specialist', employeeName: 'Budi Santoso' }
      ],
      timeline: [
        { id: 'task-1', taskName: 'Manuscript Final Verification', personInCharge: 'Evelyn Mercer', dueDate: '2026-05-12', status: TaskStatus.COMPLETED },
        { id: 'task-2', taskName: 'Layout Geometry Grid Setup', personInCharge: 'Siti Rahma', dueDate: '2026-05-14', status: TaskStatus.COMPLETED },
        { id: 'task-3', taskName: 'Cover Line Art Vector Draft', personInCharge: 'Carlos Ruiz', dueDate: '2026-05-16', status: TaskStatus.COMPLETED },
        { id: 'task-4', taskName: 'Physical Print Dummy Assembly', personInCharge: 'Budi Santoso', dueDate: '2026-05-20', status: TaskStatus.COMPLETED }
      ]
    },
    production: {
      chapters: [
        { chapterNumber: 1, chapterTitle: 'The Trail is Cold', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 6500 },
        { chapterNumber: 2, chapterTitle: 'Wind through the Canopies', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 7200 },
        { chapterNumber: 3, chapterTitle: 'Footsteps in the Timber', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 6100 },
        { chapterNumber: 4, chapterTitle: 'The Cabin at Lost Creek', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.IN_PROGRESS, wordCount: 8000 },
        { chapterNumber: 5, chapterTitle: 'Whispering Secrets', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.TODO, wordCount: 5400 }
      ],
      proofreadingStatus: TaskStatus.IN_PROGRESS,
      endorsements: [
        { id: 'end-1', author: 'Sarah Vance', title: 'Award-winning Historical Novelist', quote: 'A gorgeous, sensory voyage. Milestone has packaged a masterpiece of pacing in a binder that matches its elegant prose.', approved: true },
        { id: 'end-2', author: 'Dr. Alistair Finch', title: 'Historian & Literary Reviewer', quote: 'Brilliantly detailed and true to the era. The physical print details feel as authentic as the story itself.', approved: true }
      ],
      isbnStatus: ISBNStatus.ISSUED,
      isbnNumber: '978-602-1234-56-7',
      coverStatus: CoverStatus.APPROVED,
      covers: [
        { id: 'cov-1', conceptName: 'Pine Crest Silhouette', description: 'Copper foil stamped geometric pine outline on forest green cloth.', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', selected: true },
        { id: 'cov-2', conceptName: 'The Mystic Clearing', description: 'Dreamy atmospheric watercolor painting under misty starry mountain sky.', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400', selected: false }
      ],
      dummyBookStatus: DummyBookStatus.APPROVED,
      dummyBookSentDate: '2026-05-18',
      dummyBookFeedback: 'The linen texture is wonderful. Let\'s make the copper foil text slightly thicker on the front title.'
    },
    printing: {
      proofSent: true,
      proofSentDate: '2026-05-20',
      proofReceived: true,
      revisionNotes: 'Spine text alignment shifted leftwards by 1mm so it remains strictly centered on physical fold.',
      printingApproved: true,
      approvedBy: 'Budi Santoso',
      approvedDate: '2026-05-21',
      booksReceived: false,
      booksReceivedQty: 0,
      booksReceivedDate: ''
    },
    finalArtwork: {
      softcopySent: false,
      softcopySentDate: '',
      softcopyLink: 'https://storage.milestonebooks.com/books/whispering-pines-final.pdf',
      trophyStatus: TrophyStatus.NONE,
      trophyRecipientName: 'Arthur Green',
      trophyDesignation: 'Author of "The Whispering Pines"',
      trophyPlaqueText: 'In Honor of the Publication of "The Whispering Pines: Secrets of the Oregon Ridge". Crafted with care in cooperation with members of the Milestone Editorial Guild.'
    }
  },
  {
    id: 'proj-2',
    ownerId: '',
    projectName: 'Java Advanced Architecture',
    createdAt: '2026-05-14',
    currentPhaseIndex: 2, // Phase 3: Proposal
    clientContact: {
      name: 'Dr. Linus Dev',
      phone: '+62 821-9988-7766',
      email: 'dev@javaarchitects.org'
    },
    prospect: {
      meetingDate: '2026-05-16',
      meetingTime: '14:30',
      meetingLocation: 'Google Meet online sync',
      noted: true,
      status: ProspectStatus.PROCEED
    },
    requirementBrief: {
      briefNotes: 'Technical programming guide focusing on microservice design, Kubernetes native Java structures, and virtual threads. Requires clean monospaced layout, side-by-side code blocks, and an index. Estimated budget of Rp 225.000.000 for digital distribution and 300 premium paperback books.',
      briefDate: '2026-05-18',
      targetAudience: 'Professional Books',
      bookGenre: 'Technology & ICT'
    },
    creativeBrief: {
      proposedBookTitle: 'Enterprise Design Patterns with Quarkus & JVM',
      creativeConcept: 'High-contrast minimalist layout with blue or amber accents. Custom "Fira Code" font blocks for code. Technical vector diagrams using a clean isometric aesthetic.',
      proposedDesignStyle: 'Technical Mono, Sharp & High-Contrast',
      clientFeedbackNotes: 'Requesting if we can add an exclusive interactive companion repository link inside the introductory page. Love the dark mode cover draft.',
      feedbackStatus: FeedbackStatus.PENDING,
      feedbackDate: ''
    },
    proposal: {
      offerings: [
        { id: 'srv-10', serviceName: 'Technical Copyediting', description: 'Review syntax, consistency of technical terms, and class name formats.', cost: 60000000, selected: true },
        { id: 'srv-11', serviceName: 'Code Snippet Dry-Run & Formatting', description: 'Validating all code snippets in Quarkus 3.2 and styling them with syntax highlighting block wrappers.', cost: 37500000, selected: true },
        { id: 'srv-12', serviceName: 'Clean Isometric Art Mockups', description: 'Drafting 12 technical architectural schematics.', cost: 27000000, selected: true },
        { id: 'srv-13', serviceName: 'Matted Tech Paperback Print (300 copies)', description: 'Perfect-bound matte cover, high-contrast white pages, flat-lay spine construction.', cost: 48000000, selected: true }
      ],
      additionalTerms: 'Net 30 days upon contract final signoff.',
      dateSent: '2026-05-21',
      status: ProposalStatus.DRAFT
    },
    closing: {
      finalAmount: 172500000,
      contractStatus: ContractStatus.DRAFT,
      contractDraftText: 'Draft agreement: Milestone Group client-services for Java Advanced Architecture technical publication. Subject to change pending brief finalization.',
      signedDate: '',
      signingRepresentative: ''
    },
    preProduction: {
      outlineChapters: [
        'Chapter 1: The Modern Cloud-Native Landscape',
        'Chapter 2: Core Concepts of Reactive Concurrency',
        'Chapter 3: Virtual Threads deep dive on GraalVM',
        'Chapter 4: Microservice Mesh Configurations'
      ],
      teamAssignments: [
        { role: 'Technical Editor', employeeName: 'Vikas Patel' },
        { role: 'Layout Specialist', employeeName: 'Siti Rahma' }
      ],
      timeline: []
    },
    production: {
      chapters: [],
      proofreadingStatus: TaskStatus.TODO,
      endorsements: [],
      isbnStatus: ISBNStatus.NOT_REQUESTED,
      isbnNumber: '',
      coverStatus: CoverStatus.NOT_STARTED,
      covers: [],
      dummyBookStatus: DummyBookStatus.NONE,
      dummyBookSentDate: '',
      dummyBookFeedback: ''
    },
    printing: {
      proofSent: false,
      proofSentDate: '',
      proofReceived: false,
      revisionNotes: '',
      printingApproved: false,
      approvedBy: '',
      approvedDate: '',
      booksReceived: false,
      booksReceivedQty: 0,
      booksReceivedDate: ''
    },
    finalArtwork: {
      softcopySent: false,
      softcopySentDate: '',
      softcopyLink: '',
      trophyStatus: TrophyStatus.NONE,
      trophyRecipientName: 'Dr. Linus Dev',
      trophyDesignation: 'Author of "Enterprise Design Patterns"',
      trophyPlaqueText: ''
    }
  },
  {
    id: 'proj-3',
    ownerId: '',
    projectName: 'Echoes of Eternity',
    createdAt: '2026-04-10',
    currentPhaseIndex: 7, // Phase 8: Final Artwork
    clientContact: {
      name: 'Clara Vance',
      phone: '+1-555-019-2834',
      email: 'clara@vancegallery.co'
    },
    prospect: {
      meetingDate: '2026-04-12',
      meetingTime: '11:00',
      meetingLocation: 'Vance Contemporary Fine Art Gallery, Jakarta',
      noted: true,
      status: ProspectStatus.PROCEED
    },
    requirementBrief: {
      briefNotes: 'Ultra luxury premium landscape photographic coffee table catalog displaying international eco-spherics. Needs brilliant glossy heavy photo stock paper. Case bound with special protective slipcase cover box.',
      briefDate: '2026-04-13',
      targetAudience: 'Trade Books',
      bookGenre: 'Art & Photography'
    },
    creativeBrief: {
      proposedBookTitle: 'Echoes of Eternity: Visual Ecologies',
      creativeConcept: 'Large horizontal landscape layout (12x9 inches). High margins with stark minimalist white background framing. Deep charcoal and satin navy slip cover.',
      proposedDesignStyle: 'Minimalist Editorial Visual, Ultra Luxury',
      clientFeedbackNotes: 'Absolutely breathtaking draft. The deep satin paper option choice is fantastic.',
      feedbackStatus: FeedbackStatus.APPROVED,
      feedbackDate: '2026-04-15'
    },
    proposal: {
      offerings: [
        { id: 'srv-20', serviceName: 'Photography Editing & Directing', description: 'Curating, layout sequencing, and color grading correction of 150 high-res snapshots.', cost: 75000000, selected: true },
        { id: 'srv-21', serviceName: 'Luxury Landscape Typesetting', description: 'Precision landscape proportions editing with high margins and clean sans-serif typography.', cost: 37500500, selected: true },
        { id: 'srv-22', serviceName: 'Satin Slipcase & Matte Box Construct', description: 'Protective custom slipcase layout with metallic hot stamps.', cost: 45000000, selected: true },
        { id: 'srv-23', serviceName: 'Art-Grade Deluxe Offset Print (150 books)', description: 'Perfect case bound, 180gsm premium photographic paper, extra thick silk thread wrap bindings.', cost: 142500000, selected: true }
      ],
      additionalTerms: 'Full advance prior to high-grade offset print scheduling.',
      dateSent: '2026-04-18',
      status: ProposalStatus.APPROVED
    },
    closing: {
      finalAmount: 300000000,
      contractStatus: ContractStatus.SIGNED,
      contractDraftText: 'Closing agreement with Vance Gallery. Total amount Rp 300.000.000 paid. All delivery elements cleared for photographic collection release.',
      signedDate: '2026-04-20',
      signingRepresentative: 'Clara Vance (Sole Director)'
    },
    preProduction: {
      outlineChapters: [
        'Curated Set A: The Frozen Silences (Glaciers)',
        'Curated Set B: Salt of the Mud flats (Deserts)',
        'Curated Set C: High Altitude Breath (Canopies)',
        'Curated Set D: Abyssal Reef Reefs (Deep Ocean)'
      ],
      teamAssignments: [
        { role: 'Creative Director', employeeName: 'Carlos Ruiz' },
        { role: 'Senior Photo Colorist', employeeName: 'Siti Rahma' },
        { role: 'Production Supervisor', employeeName: 'Budi Santoso' }
      ],
      timeline: [
        { id: 'task-20', taskName: 'Color Proof Correction Run', personInCharge: 'Siti Rahma', dueDate: '2026-04-22', status: TaskStatus.COMPLETED },
        { id: 'task-21', taskName: 'Spine Box Projections Test', personInCharge: 'Carlos Ruiz', dueDate: '2026-04-24', status: TaskStatus.COMPLETED }
      ]
    },
    production: {
      chapters: [
        { chapterNumber: 1, chapterTitle: 'The Frozen Silences', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 1500 },
        { chapterNumber: 2, chapterTitle: 'Salt of the Mud flats', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 2100 },
        { chapterNumber: 3, chapterTitle: 'High Altitude Breath', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 1800 },
        { chapterNumber: 4, chapterTitle: 'Abyssal Reef Reefs', writingStatus: ProductionChapterStatus.COMPLETED, layoutStatus: ProductionChapterStatus.COMPLETED, wordCount: 1400 }
      ],
      proofreadingStatus: TaskStatus.COMPLETED,
      endorsements: [
        { id: 'end-20', author: 'Jean-Laurent Dupoint', title: 'Curator at Paris EcoArt Association', quote: 'A visual testament. Truly extraordinary binding that acts like a picture frame itself.', approved: true }
      ],
      isbnStatus: ISBNStatus.ISSUED,
      isbnNumber: '978-602-9988-11-2',
      coverStatus: CoverStatus.APPROVED,
      covers: [
        { id: 'cov-20', conceptName: 'Infinite Abyss Dark Satin cover', description: 'Luxury matte layout wrapped in dark deep water photographic slip.', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400', selected: true }
      ],
      dummyBookStatus: DummyBookStatus.APPROVED,
      dummyBookSentDate: '2026-04-28',
      dummyBookFeedback: 'Color profiles are perfect.'
    },
    printing: {
      proofSent: true,
      proofSentDate: '2026-05-01',
      proofReceived: true,
      revisionNotes: 'None, final signature.',
      printingApproved: true,
      approvedBy: 'Clara Vance',
      approvedDate: '2026-05-03',
      booksReceived: true,
      booksReceivedQty: 150,
      booksReceivedDate: '2026-05-15'
    },
    finalArtwork: {
      softcopySent: true,
      softcopySentDate: '2026-05-16',
      softcopyLink: 'https://storage.milestonebooks.com/books/vance-gallery-echoes.zip',
      trophyStatus: TrophyStatus.DELIVERED,
      trophyRecipientName: 'Clara Vance',
      trophyDesignation: 'Founder & Curator, Vance Contemporary Gallery',
      trophyPlaqueText: 'Honoring "Echoes of Eternity: Visual Ecologies" by Clara Vance. Published in exquisite high-definition print. Presented by Milestone Group as a physical symbol of publishing excellence.'
    }
  }
];

export const PHASE_NAMES = [
  'New Project Idea',       // Index 0
  'Prospect',               // Index 1
  'Proposal',               // Index 2
  'Closing',                // Index 3
  'Pre-Production',         // Index 4
  'Production',             // Index 5
  'Printing',               // Index 6
  'Final Artwork'           // Index 7
];

export const PHASE_COLORS = [
  { text: 'text-blue-600 bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  { text: 'text-amber-600 bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  { text: 'text-violet-600 bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-800' },
  { text: 'text-cyan-600 bg-cyan-50 border-cyan-200', badge: 'bg-cyan-100 text-cyan-800' },
  { text: 'text-indigo-600 bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-800' },
  { text: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-800' },
  { text: 'text-emerald-600 bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  { text: 'text-rose-600 bg-rose-50 border-rose-200', badge: 'bg-rose-100 text-rose-800' }
];
