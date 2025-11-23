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
  filePath: string;        // URL du fichier audio
  uploadDate: string;
  duree?: number;
  url?: string;        // ← ajouté par le serveur
  albumId?: number;         // ← si la chanson est dans un album
  albumTitre?: string;      // ← pour affichage
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