export type {
  CommunityReview,
  Company,
  Competition,
  CompetitionScore,
  CompetitionTrack,
  ContentFrontmatter,
  EquipmentInfo,
  EquipmentRequirement,
  ExternalListReference,
  PracticeTask,
  Project,
  Resource,
  Roadmap,
  ScoringDimension,
  ScoringModel,
  Skill,
  SkillLevel,
  Source,
  Vocabulary,
  VocabularyTerm,
} from './schemas';

export type VerificationStatus = 'draft' | 'needs_review' | 'verified' | 'stale' | 'rejected';
export type EvidenceLevel = 'high' | 'medium' | 'low';

export interface ContentEntry {
  slug: string;
  frontmatter: import('./schemas').ContentFrontmatter;
  body: string;
}

export interface DataBundle {
  competitions: import('./schemas').Competition[];
  skills: import('./schemas').Skill[];
  projects: import('./schemas').Project[];
  resources: import('./schemas').Resource[];
  roadmaps: import('./schemas').Roadmap[];
  scoringModels: import('./schemas').ScoringModel[];
  vocabularies: import('./schemas').Vocabulary[];
  reviews: import('./schemas').CommunityReview[];
  companies: import('./schemas').Company[];
}
