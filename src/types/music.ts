// src/types/music.ts

// Doit correspondre exactement à l'enum MusicGenre dans ton backend Java
export enum MusicGenre {
  POP = 'POP',
  ROCK = 'ROCK',
  RAP = 'RAP',              // ← Important : tu as RAP dans le backend, pas HIP_HOP
  CLASSIQUE = 'CLASSIQUE',
  JAZZ = 'JAZZ',
  ELECTRONIC = 'ELECTRONIC',
  REGGAE = 'REGGAE',
  RNb = 'RNb',              // ← Attention à la casse : RNb (pas RNB)
  AUTRE = 'AUTRE',
}

// Interface correspondant à ce que retourne /api/artiste/{id}/chansons (ChansonResponse)
export interface ChansonResponse {
  id: number;
  titre: string;
  url: string;
  duree: string;
  musicGenre: MusicGenre | null;
  albumId: number | null;
  albumTitre: string | null;
}

// Interface correspondant à un objet Chanson brut retourné par upload (entité Chanson)
export interface Chanson {
  id: number;
  titre: string;
  url: string;              // URL Cloudinary
  duree: string;            // "MM:SS"
  dateSortie: string;       // ISO date ex: "2026-01-03"
  musicGenre: MusicGenre | null;
  album?: Album | null;     // Optionnel : album complet si chargé
  albumId?: number | null;
  albumTitre?: string | null;
}

// Interface correspondant à ce que retourne /api/artiste/{id}/albums (AlbumResponse)
export interface AlbumResponse {
  id: number;
  titre: string;
  dateSortie: string;
  couvertureUrl: string | null;     // ← IMPORTANT
  artisteId: number;
  nomArtiste: string;
  chansons: ChansonSimple[];        // ← Tableau de chansons simplifiées
}

// Version simplifiée d'une chanson dans la liste d'un album (comme dans AlbumResponse)
export interface ChansonSimple {
  id: number;
  titre: string;
  url: string;
  duree: string;
  musicGenre: MusicGenre | null;
}

// Pour les appels internes (ex: création album), on garde une version simple
export interface Album {
  id: number;
  titre: string;
  dateSortie: string;
  couvertureUrl?: string | null;
  chansons: Chanson[];
}

export interface Artiste {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  nomArtiste: string;      // ← Important pour l'affichage
  bio?: string | null;
  nbrAbonnees?: number;
}