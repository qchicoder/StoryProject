export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'AUTHOR';
  avatar: string | null;
  wallet?: CoinWallet;
}

export interface CoinWallet {
  id: number;
  user_id: number;
  balance: number;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  stories_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Story {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  cover_url: string | null;
  content_type: 'NOVEL' | 'COMIC';
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
  view_count: number;
  author_id: number;
  category_id: number;
  is_featured: boolean;
  author?: Author;
  category?: Category;
  tags?: Tag[];
  chapters?: Chapter[];
  updated_at: string;
}

export interface Chapter {
  id: number;
  story_id: number;
  chapter_number: number;
  title: string;
  slug: string;
  is_paid: boolean;
  coin_price: number;
  view_count: number;
  status: 'DRAFT' | 'PUBLISHED';
  created_at: string;
}

export interface ComicImage {
  id: number;
  chapter_id: number;
  image_url: string;
  order_index: number;
}

export interface Comment {
  id: number;
  user_id: number;
  story_id: number;
  chapter_id: number | null;
  parent_id: number | null;
  content: string;
  likes_count: number;
  created_at: string;
  user?: User;
  replies?: Comment[];
}

export interface CoinTransaction {
  id: number;
  wallet_id: number;
  amount: number;
  type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'ADMIN_ADJUST';
  description: string;
  reference_id: string | null;
  created_at: string;
}

export interface Advertisement {
  id: number;
  title: string;
  placement: 'HEADER' | 'CHAPTER_BOTTOM' | 'SIDEBAR';
  type: 'IMAGE' | 'ADSENSE' | 'AFFILIATE';
  image_url: string | null;
  target_url: string | null;
  script_code: string | null;
  is_active: boolean;
}
