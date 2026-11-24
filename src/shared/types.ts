import type { Phase } from "./phase";

export interface PublicCategory {
  id: number;
  slug: string;
  name: string;
  award_title: string | null;
  question: string | null;
  description: string | null;
  nomination_note: string | null;
  color: string;
  ink: string;
  slots: number;
  votable: boolean;
  position: number;
  nominee_count: number;
}

export interface PublicNominee {
  id: number;
  slug: string;
  name: string;
  subtitle: string | null;
  reason: string | null;
  bio: string | null;
  merits: string[];
  links: { label: string; url: string }[];
  photo_portrait: string | null;
  photo_square: string | null;
  photo_wide: string | null;
  photo_alt: string | null;
  photo_credit: string | null;
  category_id: number;
}

export interface Sponsor {
  id: number;
  name: string;
  logo_url: string | null;
  url: string | null;
  tier: string | null;
}

export interface PhaseInfo {
  phase: Phase;
  announce_at: string | null;
  voting_opens_at: string | null;
  voting_closes_at: string | null;
  results_at: string | null;
}

export interface SiteInfo {
  phase: PhaseInfo;
  contact_email: string | null;
  instagram_url: string | null;
  footer_pages: { slug: string; title: string }[];
  turnstile_site_key: string | null;
  random_order: boolean;
  now: number;
}

export interface Winner {
  category: PublicCategory;
  nominees: PublicNominee[];
  winner: PublicNominee | null;
  reason: string | null;
}

export type RouteName =
  | "home"
  | "categories"
  | "category"
  | "nominee"
  | "vote"
  | "receipt"
  | "winners"
  | "palmares"
  | "winner"
  | "page"
  | "not_found"
  | "admin";

export interface PageMeta {
  title: string;
  description: string;
  image?: string | null;
  canonical?: string;
  noindex?: boolean;
}

export interface RoutePayload<D = unknown> {
  route: RouteName;
  path: string;
  status: number;
  site: SiteInfo;
  data: D;
  meta: PageMeta;
}

export interface HomeData {
  categories: PublicCategory[];
  mosaic: PublicNominee[];
  sponsors: Sponsor[];
  totalNominees: number;
}
export interface CategoriesData {
  categories: PublicCategory[];
}
export interface CategoryData {
  category: PublicCategory;
  nominees: PublicNominee[];
  hidden: boolean;
  winnerId: number | null;
  prev: { slug: string; name: string } | null;
  next: { slug: string; name: string } | null;
}
export interface NomineeData {
  nominee: PublicNominee;
  category: PublicCategory;
  siblings: { slug: string; name: string }[];
  isWinner: boolean;
}
export interface VoteData {
  categories: (PublicCategory & { nominees: PublicNominee[] })[];
}
export interface WinnersData {
  awards: Winner[];
  published: boolean;
}
export interface WinnerData {
  award: Winner;
}
export interface InfoPageData {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  status: "draft" | "approved";
  updated_at: string;
}
