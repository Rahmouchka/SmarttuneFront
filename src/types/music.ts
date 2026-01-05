// src/types/music.ts

export enum MusicGenre {
  POP = 'POP',
  ROCK = 'ROCK',
  HIP_HOP = 'HIP_HOP',
  JAZZ = 'JAZZ',
  CLASSICAL = 'CLASSICAL',
  ELECTRONIC = 'ELECTRONIC',
  RNB = 'RNB',
  COUNTRY = 'COUNTRY',
  REGGAE = 'REGGAE',
  BLUES = 'BLUES',
}

export interface Chanson {
  id: number;
  titre: string;
  musicGenre?: MusicGenre;
  filePath: string;
  uploadDate: string;
  duree?: number;
  url?: string;
  albumId?: number;
  albumTitre?: string;
}

export interface Album {
  id: number;
  titre: string;
  dateCreation: string;
  chansons: Chanson[];
}

export interface Artiste {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

// === TYPES POUR LA PARTIE USER (ajoutés par toi) ===

export interface ChansonSimple {
  id: number;
  titre: string;
  url: string;
  musicGenre: string;
}

export interface ChansonResponse {
  id: number;
  titre: string;
  url: string;
  duree?: string;
  musicGenre: string;
  albumId?: number | null;
  albumTitre?: string | null;
}

export interface Playlist {
  id: number;
  titre: string;
  dateCreation: string;
  visible: boolean;
  createurId: number;
  chansons: ChansonSimple[];
}

export interface PlaylistResponse {
  id: number;
  titre: string;
  dateCreation: string;
  visible: boolean;
  createurId: number;
  chansons: ChansonSimple[];
}

export interface FavorisResponse {
  chansons: ChansonSimple[];
}