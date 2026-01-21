export type MediaType = "ALBUM" | "TRACK" | "ARTIST";
export type OAuthProvider = "LOCAL" | "SPOTIFY" | "GOOGLE";

export interface Media {
  id: string;
  title: string;
  artistName: string;
  imageUrl: string | null;
  releaseDate: string | null;
  type: MediaType;
  itunesUrl: string | null;
  averageRating: number | null;
  ratingCount: number;
  description: string | null;
  cachedAt: string;
}


export interface Album extends Media {
  type: "ALBUM";
  description: string | null;
  genre: string | null;
  label: string | null;
}
export interface Artist extends Media {
  type: "ARTIST";
  description: string | null;
  genre: string | null;
}
export interface Track extends Media {
  type: "TRACK";
  description: string | null;
  genre: string | null;
  duration: number | null;
  trackNumber: number | null;
  thumbnailUrl: string | null;
}


export interface User {
  id: string;
  email: string;
  username: string;
  spotifyId: string | null;
  googleId: string | null;
  oauthProvider: OAuthProvider;
  createdAt: string;
}

export interface UserLibraryEntry {
  id: string;
  mediaId: string;
  mediaTitle: string;
  artistName: string;
  imageUrl: string | null;
  mediaType: MediaType;
  rating: number | null;
  isFavorite: boolean;
  comment: string | null;
  addedAt: string;
  updatedAt: string | null;
}

export interface CreateLibraryEntryRequest {
  mediaId: string;
  rating?: number;
  isFavorite?: boolean;
  comment?: string;
}

export interface UpdateLibraryEntryRequest {
  rating?: number;
  isFavorite?: boolean;
  comment?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export function isAlbum(media: Media): media is Album {
  return media.type === "ALBUM";
}
export function isArtist(media: Media): media is Artist {
  return media.type === "ARTIST";
}
export function isTrack(media: Media): media is Track {
  return media.type === "TRACK";
}