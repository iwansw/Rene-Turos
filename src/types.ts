export enum ProspectStatus {
  PENDING = 'pending',
  PROCEED = 'proceed'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ProposalStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  APPROVED = 'approved',
  DECLINED = 'declined'
}

export enum ContractStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  SIGNED = 'signed'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export enum ProductionChapterStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export enum ISBNStatus {
  NOT_REQUESTED = 'not_requested',
  PENDING = 'pending',
  ISSUED = 'issued'
}

export enum CoverStatus {
  NOT_STARTED = 'not_started',
  CONCEPTS_PROPOSED = 'concepts_proposed',
  APPROVED = 'approved'
}

export enum DummyBookStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved'
}

export enum TrophyStatus {
  NONE = 'none',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export interface ProjectContact {
  name: string;
  phone: string;
  email: string;
}

export interface ProspectDetails {
  meetingDate: string;
  meetingTime: string;
  meetingLocation: string;
  noted: boolean;
  status: ProspectStatus;
  meetingDone?: boolean;
  meetingDoneDate?: string;
  minutesOfMeetingFileName?: string;
  minutesOfMeetingFileData?: string;
  minutesOfMeetingUploadedBy?: string;
  minutesOfMeetingUploadedAt?: string;
  assignedTeammates?: string[];
}

export interface BriefDocument {
  name: string;
  data: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface BriefLogEntry {
  id: string;
  notes: string;
  timestamp: string;
  authorName: string;
  authorUsername?: string;
}

export interface RequirementBrief {
  briefNotes: string;
  briefDate: string;
  targetAudience: string;
  bookGenre: string;
  documents?: BriefDocument[];
  logs?: BriefLogEntry[];
}

export interface CreativeBrief {
  proposedBookTitle: string;
  creativeConcept: string;
  proposedDesignStyle: string;
  clientFeedbackNotes: string;
  feedbackStatus: FeedbackStatus;
  feedbackDate: string;
  creativeConceptDocuments?: BriefDocument[];
  feedbackLogs?: BriefLogEntry[];
}

export interface ServiceOffering {
  id: string;
  serviceName: string;
  description: string;
  cost: number;
  selected: boolean;
}

export interface ProposalDetails {
  offerings: ServiceOffering[];
  additionalTerms: string;
  dateSent: string;
  status: ProposalStatus;
  documents?: BriefDocument[];
}

export interface ClosingDetails {
  finalAmount: number;
  contractStatus: ContractStatus;
  contractDraftText: string;
  signedDate: string;
  signingRepresentative: string;
  contractDraftDocuments?: BriefDocument[];
  signedContractDocuments?: BriefDocument[];
}

export interface TeamAssignment {
  role: string;
  employeeName: string;
}

export interface TimelineTask {
  id: string;
  taskName: string;
  personInCharge: string;
  dueDate: string;
  startDate?: string;
  status: TaskStatus;
}

export interface PreProductionDetails {
  outlineChapters: string[];
  teamAssignments: TeamAssignment[];
  timeline: TimelineTask[];
}

export interface ChapterProgress {
  chapterNumber: number;
  chapterTitle: string;
  writingStatus: ProductionChapterStatus;
  layoutStatus: ProductionChapterStatus;
  wordCount: number;
}

export interface EndorsementQuote {
  id: string;
  author: string;
  title: string;
  quote: string;
  approved: boolean;
}

export interface CoverProposal {
  id: string;
  conceptName: string;
  description: string;
  imageUrl: string;
  selected: boolean;
}

export interface ProductionDetails {
  chapters: ChapterProgress[];
  proofreadingStatus: TaskStatus;
  endorsements: EndorsementQuote[];
  isbnStatus: ISBNStatus;
  isbnNumber: string;
  coverStatus: CoverStatus;
  covers: CoverProposal[];
  dummyBookStatus: DummyBookStatus;
  dummyBookSentDate: string;
  dummyBookFeedback: string;
}

export interface PrintingDetails {
  proofSent: boolean;
  proofSentDate: string;
  proofReceived: boolean;
  revisionNotes: string;
  printingApproved: boolean;
  approvedBy: string;
  approvedDate: string;
  booksReceived: boolean;
  booksReceivedQty: number;
  booksReceivedDate: string;
}

export interface FinalArtworkDetails {
  softcopySent: boolean;
  softcopySentDate: string;
  softcopyLink: string;
  trophyStatus: TrophyStatus;
  trophyRecipientName: string;
  trophyDesignation: string;
  trophyPlaqueText: string;
}

export interface BookProject {
  id: string;
  ownerId: string;
  creatorName?: string;
  creatorUsername?: string;
  projectName: string;
  clientContact: ProjectContact;
  currentPhaseIndex: number; // 0 to 9 representing Phases 1 to 10
  createdAt: string;
  
  // Phase 1 to 10 Data
  prospect: ProspectDetails;
  requirementBrief: RequirementBrief;
  creativeBrief: CreativeBrief;
  proposal: ProposalDetails;
  closing: ClosingDetails;
  preProduction: PreProductionDetails;
  production: ProductionDetails;
  printing: PrintingDetails;
  finalArtwork: FinalArtworkDetails;
}

export interface BookGenreCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MarketCategory {
  id: string;
  name: string;
  description?: string;
}

