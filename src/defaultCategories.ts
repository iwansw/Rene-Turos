import { BookGenreCategory, MarketCategory } from './types';

export const DEFAULT_GENRES: BookGenreCategory[] = [
  { id: 'genre-lit-fic', name: 'Literary Fiction' },
  { id: 'genre-romance', name: 'Romance' },
  { id: 'genre-mystery', name: 'Mystery' },
  { id: 'genre-thriller', name: 'Thriller/Suspense' },
  { id: 'genre-horror', name: 'Horror' },
  { id: 'genre-scifi', name: 'Science Fiction (Sci-Fi)' },
  { id: 'genre-fantasy', name: 'Fantasy' },
  { id: 'genre-hist-fic', name: 'Historical Fiction' },
  { id: 'genre-adventure', name: 'Adventure' },
  { id: 'genre-children-fic', name: 'Children’s Fiction' },
  { id: 'genre-drama', name: 'Drama' },
  { id: 'genre-crime', name: 'Crime Fiction' },
  { id: 'genre-paranormal', name: 'Paranormal' },
  { id: 'genre-dystopian', name: 'Dystopian' },
  { id: 'genre-graphic-novels', name: 'Graphic Novels/Comics' },
  { id: 'genre-biography', name: 'Biography/Autobiography' },
  { id: 'genre-memoir', name: 'Memoir' },
  { id: 'genre-self-help', name: 'Self-Help' },
  { id: 'genre-business', name: 'Business & Management' },
  { id: 'genre-education', name: 'Education/Academic' },
  { id: 'genre-religion', name: 'Religion & Spirituality' },
  { id: 'genre-health', name: 'Health & Wellness' },
  { id: 'genre-tech', name: 'Technology & ICT' },
  { id: 'genre-science', name: 'Science' },
  { id: 'genre-history', name: 'History' },
  { id: 'genre-politics', name: 'Politics & Government' },
  { id: 'genre-travel', name: 'Travel' },
  { id: 'genre-cooking', name: 'Cooking/Culinary' },
  { id: 'genre-art', name: 'Art & Photography' },
  { id: 'genre-parenting', name: 'Parenting & Family' },
  { id: 'genre-islamic-books', name: 'Religion & Islamic Books' }
];

export const DEFAULT_MARKETS: MarketCategory[] = [
  { id: 'market-trade', name: 'Trade Books' },
  { id: 'market-edu', name: 'Educational Books' },
  { id: 'market-prof', name: 'Professional Books' },
  { id: 'market-ref', name: 'Reference Books' },
  { id: 'market-academic', name: 'Academic Journals' },
  { id: 'market-children', name: 'Children Books' },
  { id: 'market-digital', name: 'Digital/eBooks' }
];
